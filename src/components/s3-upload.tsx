'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MinioUploadedFile {
  key: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

// Backward compatibility alias
export type S3UploadedFile = MinioUploadedFile;

interface MinioUploadProps {
  formId: string;
  onFilesUploaded: (files: MinioUploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

// Backward compatibility alias
type S3UploadProps = MinioUploadProps;

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  };
}

export default function MinioUpload({
  formId,
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
  className,
}: MinioUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MinioUploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadFileToMinio = async (file: File): Promise<MinioUploadedFile> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    try {
      // Update progress
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 0, status: 'uploading' }
      }));

      // Get presigned URL from MinIO
      const response = await fetch('/api/minio/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          formId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileKey } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update progress to completed
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { progress: 100, status: 'completed' }
      }));

      return {
        key: fileKey,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { 
          progress: 0, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }));
      throw error;
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes and types
    for (const file of fileArray) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
        return;
      }
    }

    try {
      const uploadPromises = fileArray.map(uploadFileToMinio);
      const newFiles = await Promise.all(uploadPromises);
      
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploadedFiles, maxFiles, maxFileSize, formId, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Maximum {maxFiles} files, up to {maxFileSize / 1024 / 1024}MB each
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = acceptedFileTypes.join(',');
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) handleFileUpload(files);
            };
            input.click();
          }}
        >
          Select Files
        </Button>
      </div>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([fileId, progress]) => (
        <div key={fileId} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {fileId.split('-')[0]}
            </span>
            <span className="text-sm text-gray-500">
              {progress.status === 'uploading' && `${progress.progress}%`}
              {progress.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            </span>
          </div>
          {progress.status === 'uploading' && (
            <Progress value={progress.progress} className="h-2" />
          )}
          {progress.status === 'error' && (
            <p className="text-sm text-red-500">{progress.error}</p>
          )}
        </div>
      ))}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Backward compatibility alias
export { MinioUpload as S3Upload };