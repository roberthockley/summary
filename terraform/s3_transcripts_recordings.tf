resource "aws_s3_bucket" "transcripts" {
  bucket = "${var.project.tla}-recordings-transcripts"
}

resource "aws_s3_bucket_notification" "bucket_notification_transcribe" {
  depends_on = [aws_lambda_permission.allow_s3_to_invoke_lambda_transcribe]
  bucket = aws_s3_bucket.transcripts.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_transcribe.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "recordings/"
    filter_suffix       = ".wav"
  }
}

resource "aws_s3_bucket_notification" "bucket_notification_comprehend" {
  depends_on = [aws_lambda_permission.allow_s3_to_invoke_lambda_comprehend]
  bucket = aws_s3_bucket.transcripts.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_comprehend.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "transcripts/"
    filter_suffix       = ".json"
  }
}