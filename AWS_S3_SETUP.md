# AWS S3 Integration Setup

This guide will help you set up AWS S3 integration for file uploads in your form application.

## Prerequisites

1. AWS Account
2. AWS CLI installed (optional but recommended)
3. Basic understanding of AWS IAM

## Step 1: Create S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `your-app-name-forms-storage`)
5. Select your preferred region
6. Configure bucket settings:
   - **Block Public Access**: Keep all options checked for security
   - **Bucket Versioning**: Enable if you want file versioning
   - **Server-side encryption**: Enable with Amazon S3 managed keys (SSE-S3)

## Step 2: Configure CORS

1. Go to your bucket → Permissions → Cross-origin resource sharing (CORS)
2. Add the following CORS configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## Step 3: Create IAM User

1. Navigate to IAM service
2. Click "Users" → "Add user"
3. Choose a username (e.g., `s3-forms-uploader`)
4. Select "Programmatic access"
5. Create a custom policy with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

6. Attach this policy to the user
7. Save the **Access Key ID** and **Secret Access Key**

## Step 4: Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
NEXT_PUBLIC_AWS_REGION=your_aws_region
NEXT_PUBLIC_S3_BUCKET_NAME=your_bucket_name
```

## Step 5: Configure CORS (PENTING!)

**Error "Failed to fetch" terjadi karena CORS belum dikonfigurasi. Ikuti langkah ini:**

1. Buka AWS S3 Console
2. Pilih bucket `alur-ai`
3. Klik tab "Permissions"
4. Scroll ke bagian "Cross-origin resource sharing (CORS)"
5. Klik "Edit" dan masukkan konfigurasi berikut:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:9003",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Klik "Save changes"

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Create a form with a file input
3. Try uploading a file
4. Check your S3 bucket to verify the file was uploaded

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** in production instead of access keys when possible
3. **Implement file type validation** on both client and server
4. **Set up CloudFront** for better performance and security
5. **Enable S3 access logging** for audit trails
6. **Use presigned URLs** with short expiration times

## File Organization

Files are organized in S3 with the following structure:
```
forms/
├── {formId}/
│   ├── {timestamp}-{filename1}
│   ├── {timestamp}-{filename2}
│   └── ...
```

## Troubleshooting

### Common Issues:

1. **CORS errors**: Check your CORS configuration and allowed origins
2. **Access denied**: Verify IAM permissions and bucket policies
3. **File not uploading**: Check network connectivity and AWS credentials
4. **Large file uploads**: Consider implementing multipart upload for files > 100MB

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test AWS credentials with AWS CLI
4. Check S3 bucket permissions

## Production Considerations

1. **Use CloudFront** for CDN and better performance
2. **Implement lifecycle policies** to manage storage costs
3. **Set up monitoring** with CloudWatch
4. **Use AWS Lambda** for server-side file processing
5. **Implement virus scanning** for uploaded files

## Cost Optimization

1. Use **S3 Intelligent Tiering** for automatic cost optimization
2. Set up **lifecycle policies** to move old files to cheaper storage classes
3. Monitor usage with **AWS Cost Explorer**
4. Consider **S3 Transfer Acceleration** for global users