import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const accessToken = request.cookies.get('google_access_token')?.value;
    const refreshToken = request.cookies.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Google Drive' },
        { status: 401 }
      );
    }

    // Set credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer and then to stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName || file.name,
        parents: undefined // Will be saved to root folder
      },
      media: {
        mimeType: file.type,
        body: stream
      }
    });

    // Make file publicly viewable (optional)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Generate public URL
    const fileUrl = `https://drive.google.com/file/d/${response.data.id}/view`;
    const downloadUrl = `https://drive.google.com/uc?id=${response.data.id}`;

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      fileUrl,
      downloadUrl,
      mimeType: file.type,
      size: file.size
    });

  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    
    // Handle token refresh if needed
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Authentication expired. Please reconnect to Google Drive.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file to Google Drive' },
      { status: 500 }
    );
  }
}