const { TranscribeClient, StartTranscriptionJobCommand, StartCallAnalyticsJobCommand } = require("@aws-sdk/client-transcribe");

const transcribeClient = new TranscribeClient({
    region: process.env.AWS_REGION
});

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    try {
        const record = event.Records[0];
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;
        const filename = record.s3.object.key.slice(11).slice(0, -4)

        /*
        const params = {
            TranscriptionJobName: `TranscriptionJob-${Date.now()}`,
            LanguageCode: "en-US",
            MediaFormat: "wav",
            Media: {
                MediaFileUri: `s3://${bucketName}/${objectKey}`,
            },
            OutputBucketName: bucketName,
            OutputKey: `transcripts/${filename}.json`,
        };

        const data = await client.send(new StartTranscriptionJobCommand(params));
        console.log("Transcription job started:", data);
        */
        const callAnalyticsParams = {
            CallAnalyticsJobName: `CallAnalytics-${Date.now()}`,
            MediaFormat: "wav",
            Media: {
                MediaFileUri: `s3://${bucketName}/${objectKey}`,
            },
            OutputLocation: `s3://${bucketName}/call-analytics/`,
            DataAccessRoleArn: process.env.TRANSCRIBE_ROLE_ARN, // Make sure to set this in Lambda environment variables
            Settings: {
                Summarization: {
                    GenerateAbstractiveSummary: true,
                    SummaryType: ["CALL_SUMMARY"] // You can also add "ISSUE", "ACTION_ITEM", "OUTCOME"
                }
            },
            ChannelDefinitions: [ // ChannelDefinitions
                { // ChannelDefinition
                    ChannelId: Number(1),
                    ParticipantRole: "AGENT"
                },
                { // ChannelDefinition
                    ChannelId: Number(0),
                    ParticipantRole: "AGENT"
                }
            ],
        };


        // Start the Call Analytics job
        const startCommand = new StartCallAnalyticsJobCommand(callAnalyticsParams);
        const startResponse = await transcribeClient.send(startCommand);

        // Wait for the job to complete
        const jobName = startResponse.CallAnalyticsJob.CallAnalyticsJobName;
        let jobStatus = 'IN_PROGRESS';

        while (jobStatus === 'IN_PROGRESS') {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again

            const getJobCommand = new GetCallAnalyticsJobCommand({
                CallAnalyticsJobName: jobName
            });

            const jobResponse = await transcribeClient.send(getJobCommand);
            jobStatus = jobResponse.CallAnalyticsJob.CallAnalyticsJobStatus;

            if (jobStatus === 'FAILED') {
                throw new Error('Call Analytics job failed');
            }
        }


        return {
            statusCode: 200,
            body: JSON.stringify('Transcription job initiated successfully'),
        };

    } catch (error) {
        console.error("Error starting transcription job:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error starting transcription job',
                error: error.message
            }),
        };
    }
};
