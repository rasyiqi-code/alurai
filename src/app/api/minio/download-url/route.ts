import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedDownloadUrl, validateMinioConfig } from '@/lib/minio';

export async function POST(request: NextRequest) {
  try {
    // Validate MinIO configuration
    if (!validateMinioConfig()) {
      return NextResponse.json(
        { error: 'MinIO configuration is incomplete' },
        { status: 500 }
      );
    }

    const { fileKey } = await request.json();

    // Validate required fields
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Missing required field: fileKey' },
        { status: 400 }
      );
    }

    // Generate presigned download URL using MinIO SDK
    const downloadUrl = await generatePresignedDownloadUrl(fileKey);

    console.log('Generated MinIO download URL for:', fileKey);

    return NextResponse.json({
      downloadUrl,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}