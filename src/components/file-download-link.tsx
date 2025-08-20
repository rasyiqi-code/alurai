'use client';

import { Download } from 'lucide-react';
import { MinioUploadedFile } from '@/components/minio-upload';

interface FileDownloadLinkProps {
  file: MinioUploadedFile;
}

export const FileDownloadLink = ({ file }: FileDownloadLinkProps) => {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/minio/download-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileKey: file.key }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      
      const { downloadUrl } = await response.json();
      
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };
  
  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
    >
      <Download className="h-3 w-3" />
      {file.name}
    </button>
  );
};