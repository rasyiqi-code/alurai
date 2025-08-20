import * as Minio from 'minio';

// MinIO Configuration
const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
const MINIO_ENDPOINT = process.env.NEXT_PUBLIC_MINIO_ENDPOINT!;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

// Extract hostname and port from endpoint URL
const endpointUrl = new URL(MINIO_ENDPOINT);
const useSSL = endpointUrl.protocol === 'https:';
const port = endpointUrl.port ? parseInt(endpointUrl.port) : (useSSL ? 443 : 80);

// MinIO Client Configuration
const minioClient = new Minio.Client({
  endPoint: endpointUrl.hostname,
  port: port,
  useSSL: useSSL,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

export interface MinioUploadedFile {
  key: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

// Generate presigned URL for file upload
export async function generatePresignedUploadUrl(
  fileName: string,
  fileType: string,
  formId: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  const fileKey = `forms/${formId}/${Date.now()}-${fileName}`;
  
  try {
    // Generate presigned URL for PUT operation (upload)
    const uploadUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      fileKey,
      24 * 60 * 60 // 24 hours expiry
    );
    
    return {
      uploadUrl,
      fileKey,
    };
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

// Generate presigned URL for file download
export async function generatePresignedDownloadUrl(
  fileKey: string
): Promise<string> {
  try {
    // Generate presigned URL for GET operation (download)
    const downloadUrl = await minioClient.presignedGetObject(
      BUCKET_NAME,
      fileKey,
      60 * 60 // 1 hour expiry
    );
    
    return downloadUrl;
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

// Delete file from MinIO
export async function deleteMinioFile(fileKey: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileKey);
    console.log('File deleted successfully:', fileKey);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

// Get public file URL (if bucket is public)
export function getPublicFileUrl(fileKey: string): string {
  return `${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileKey}`;
}

// Validate MinIO configuration
export function validateMinioConfig(): boolean {
  return !!
    BUCKET_NAME &&
    MINIO_ENDPOINT &&
    ACCESS_KEY &&
    SECRET_KEY;
}

// List files in a specific form directory
export async function listFormFiles(formId: string): Promise<MinioUploadedFile[]> {
  try {
    const prefix = `forms/${formId}/`;
    const files: MinioUploadedFile[] = [];
    
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          const fileName = obj.name.split('/').pop() || obj.name;
          const originalName = fileName.replace(/^\d+-/, ''); // Remove timestamp prefix
          
          files.push({
            key: obj.name,
            name: originalName,
            size: obj.size || 0,
            type: '', // MinIO doesn't return content type in list
            uploadedAt: obj.lastModified?.toISOString() || new Date().toISOString(),
          });
        }
      });
      
      stream.on('end', () => {
        resolve(files);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

// Check if bucket exists and create if not
export async function ensureBucketExists(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log('Bucket created successfully:', BUCKET_NAME);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw new Error('Failed to ensure bucket exists');
  }
}

export { minioClient };