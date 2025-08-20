# Migration from Google Drive to AWS S3

This document outlines the migration from Google Drive integration to AWS S3 for file storage in the form application.

## What Changed

### 🔄 **Replaced Components**
- `GoogleDriveDemo` → `S3Upload`
- Google Drive API calls → AWS S3 presigned URLs
- Google Drive file structure → S3 bucket organization

### 📁 **File Structure Changes**

**Before (Google Drive):**
```
Google Drive/
└── Form Files/
    ├── form1_file1.pdf
    ├── form1_file2.jpg
    └── ...
```

**After (S3):**
```
S3 Bucket/
└── forms/
    ├── {formId}/
    │   ├── {timestamp}-{filename1}
    │   ├── {timestamp}-{filename2}
    │   └── ...
    └── {anotherFormId}/
        └── ...
```

### 🔧 **Code Changes**

#### State Management
```typescript
// Before
const [googleDriveFiles, setGoogleDriveFiles] = useState<{ [key: string]: any }>({});

// After
const [s3Files, setS3Files] = useState<S3UploadedFile[]>([]);
```

#### File Upload Handler
```typescript
// Before
const handleGoogleDriveUpload = (stepIndex: number, fileData: any) => {
  setGoogleDriveFiles(prev => ({
    ...prev,
    [stepIndex]: fileData
  }));
};

// After
const handleS3Upload = (stepIndex: number, files: S3UploadedFile[]) => {
  setS3Files(files);
  const fileNames = files.map(file => file.name).join(', ');
  setAnswers(prev => ({
    ...prev,
    [stepIndex]: files.length > 0 ? `Files uploaded: ${fileNames}` : ''
  }));
};
```

#### Component Usage
```tsx
{/* Before */}
<GoogleDriveDemo 
  onDataParsed={(fileData) => handleGoogleDriveUpload(currentStep, fileData)}
/>

{/* After */}
<S3Upload 
  formId={formFlowData.id}
  onFilesUploaded={(files) => handleS3Upload(currentStep, files)}
  maxFiles={5}
  maxFileSize={10 * 1024 * 1024}
/>
```

## Benefits of S3 Migration

### 🚀 **Performance**
- **Faster uploads**: Direct browser-to-S3 uploads
- **Better scalability**: No server bottlenecks
- **CDN integration**: CloudFront for global delivery
- **Parallel uploads**: Multiple files simultaneously

### 🔒 **Security**
- **Presigned URLs**: Temporary, secure upload links
- **Fine-grained permissions**: IAM-based access control
- **Encryption**: Server-side encryption by default
- **Private buckets**: No public access by default

### 💰 **Cost Efficiency**
- **Pay-per-use**: Only pay for storage and transfers
- **Storage classes**: Automatic cost optimization
- **No API limits**: Unlike Google Drive API quotas
- **Lifecycle policies**: Automatic archiving

### 🛠 **Developer Experience**
- **Better APIs**: RESTful and well-documented
- **Multiple SDKs**: Support for various languages
- **Monitoring**: CloudWatch integration
- **Backup**: Cross-region replication

## Migration Steps Completed

✅ **Dependencies**
- Installed `@aws-sdk/client-s3`
- Installed `@aws-sdk/s3-request-presigner`
- Added `@radix-ui/react-progress`

✅ **Infrastructure**
- Created S3 utility functions (`src/lib/s3.ts`)
- Created presigned URL API endpoint (`src/app/api/s3/presigned-url/route.ts`)
- Added environment variables configuration

✅ **Components**
- Created `S3Upload` component with drag & drop
- Added upload progress indicators
- Implemented file validation and error handling

✅ **Integration**
- Updated `conversational-form.tsx` to use S3Upload
- Modified state management for S3 files
- Updated form persistence logic

✅ **Documentation**
- Created AWS S3 setup guide
- Added environment variables example
- Created migration documentation

## Next Steps (Optional Enhancements)

### 🔄 **Advanced Features**
1. **Multipart Upload**: For large files (>100MB)
2. **Image Optimization**: Automatic resizing and compression
3. **Virus Scanning**: AWS Lambda integration
4. **File Preview**: Generate thumbnails for images/PDFs

### 📊 **Monitoring & Analytics**
1. **CloudWatch Metrics**: Upload success rates
2. **Cost Monitoring**: Track storage and transfer costs
3. **Usage Analytics**: File type and size statistics

### 🌐 **Production Optimizations**
1. **CloudFront CDN**: Global file delivery
2. **Lambda@Edge**: Custom processing at edge locations
3. **Cross-region Replication**: Disaster recovery
4. **Lifecycle Policies**: Automatic archiving

## Environment Setup Required

To use the S3 integration, you need to:

1. **Create AWS Account** and S3 bucket
2. **Configure IAM permissions** for S3 access
3. **Set environment variables** in `.env.local`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_S3_BUCKET_NAME=your_bucket_name
   ```
4. **Configure CORS** on your S3 bucket

See `AWS_S3_SETUP.md` for detailed setup instructions.

## Rollback Plan

If you need to rollback to Google Drive:

1. Revert the import in `conversational-form.tsx`
2. Restore `googleDriveFiles` state management
3. Switch back to `GoogleDriveDemo` component
4. Remove S3-related files and dependencies

However, we recommend sticking with S3 for the benefits outlined above.