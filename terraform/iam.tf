resource "aws_iam_role" "iam_role_lambda_ssm" {
  name = "RoleForLamdaComprehend"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

}

resource "aws_iam_role_policy_attachment" "lambda_comprehend" {
  role       = aws_iam_role.iam_role_lambda_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/ComprehendFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_transcribe" {
  role       = aws_iam_role.iam_role_lambda_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonTranscribeFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.iam_role_lambda_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.iam_role_lambda_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}
