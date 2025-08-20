import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, validateMinioConfig } from '@/lib/minio';

export async function POST(request: NextRequest) {
  try {
    // Validate MinIO configuration
    if (!validateMinioConfig()) {
      return NextResponse.json(
        { error: 'MinIO configuration is incomplete' },
        { status: 500 }
      );
    }

    const { fileName, fileType, formId } = await request.json();

    // Validate required fields
    if (!fileName || !fileType || !formId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, formId' },
        { status: 400 }
      );
    }

    // Validate file type (basic security check)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Generate presigned URL using MinIO SDK
    const { uploadUrl, fileKey } = await generatePresignedUploadUrl(
      fileName,
      fileType,
      formId
    );

    console.log('Generated MinIO presigned URL:', uploadUrl);
    console.log('File key:', fileKey);
    console.log('Bucket name:', process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME);
    console.log('MinIO Endpoint:', process.env.NEXT_PUBLIC_MINIO_ENDPOINT);

    return NextResponse.json({
      uploadUrl,
      fileKey,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}