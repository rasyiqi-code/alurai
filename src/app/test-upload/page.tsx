'use client';

import React, { useState } from 'react';
import { MinioUpload, MinioUploadedFile } from '@/components/minio-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Download, Trash2 } from 'lucide-react';

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<MinioUploadedFile[]>([]);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleFilesUploaded = (files: MinioUploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setTestResults({
      success: true,
      message: `Successfully uploaded ${files.length} file(s) to MinIO`,
      timestamp: new Date().toLocaleString()
    });
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setTestResults(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MinIO Upload Test</h1>
        <p className="text-muted-foreground">
          Test page to verify file upload configuration to MinIO server.
        </p>
      </div>

      {/* MinIO Configuration Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            MinIO Configuration
          </CardTitle>
          <CardDescription>
            Information about the MinIO configuration currently in use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Endpoint:</p>
              <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Bucket:</p>
              <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME || 'Not configured'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">MinIO Endpoint:</p>
            <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status:</p>
              <div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Ready for Testing
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Component */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload File Test</CardTitle>
          <CardDescription>
            Select files to test upload to MinIO server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MinioUpload
            formId="test-upload"
            onFilesUploaded={handleFilesUploaded}
            maxFiles={10}
            maxFileSize={50 * 1024 * 1024} // 50MB
            acceptedFileTypes={[
              'image/*',
              'application/pdf',
              'text/*',
              '.doc',
              '.docx',
              '.xls',
              '.xlsx',
              '.zip',
              '.rar'
            ]}
          />
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                <Badge variant={testResults.success ? 'default' : 'destructive'}>
                  {testResults.success ? 'Success' : 'Failed'}
                </Badge>
              </p>
              <p className="text-sm">
                <span className="font-medium">Message:</span> {testResults.message}
              </p>
              <p className="text-sm">
                <span className="font-medium">Timestamp:</span> {testResults.timestamp}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
                <CardDescription>
                  List of files successfully uploaded to MinIO
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={`${file.key}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Uploaded
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono">
                      {file.key}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}