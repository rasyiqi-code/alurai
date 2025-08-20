'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { S3UploadedFile } from '@/components/s3-upload';
import { MinioUploadedFile } from '@/lib/minio';

interface ExportToExcelProps {
  data: any[];
  headers: string[];
  formTitle: string;
  formFlow: any[];
}

const formatValueForExport = async (value: any): Promise<string> => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (value && typeof value === 'object' && value.toDate) {
      // Firestore Timestamp
      return format(value.toDate(), 'PPpp');
    }
    
    if (typeof value === 'string' && value.startsWith('placeholder/for/')) {
      return value.replace('placeholder/for/', '');
    }
    
    // Check if value is S3 file data (JSON string)
    if (typeof value === 'string' && value.startsWith('[{') && value.includes('"key"')) {
      try {
        const files = JSON.parse(value) as S3UploadedFile[];
        const downloadUrls = await Promise.all(
          files.map(async (file) => {
            try {
              const response = await fetch('/api/minio/download-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileKey: file.key }),
        });
              
              if (!response.ok) {
                return `${file.name} (Error getting download URL)`;
              }
              
              const { downloadUrl } = await response.json();
              return `${file.name}: ${downloadUrl}`;
            } catch (error) {
              return `${file.name} (Error: ${error})`;
            }
          })
        );
        return downloadUrls.join('\n');
      } catch (error) {
        console.error('Error parsing S3 file data:', error);
        return String(value);
      }
    }
    
    return String(value);
  };

export function ExportToExcel({ data, headers, formTitle, formFlow }: ExportToExcelProps) {
  const handleExport = async () => {
    if (data.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Prepare the data for Excel with async formatting
    const excelData = await Promise.all(
      data.map(async submission => {
        const row: any = {
          'Submitted At': format(new Date(submission.submittedAt), 'PPpp')
        };
        
        for (const header of headers) {
          const field = formFlow.find(f => f.key === header);
          const columnName = field?.question || header;
          row[columnName] = await formatValueForExport(submission[header]);
        }
        
        return row;
      })
    );

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width 50 characters
    });
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate filename with current date
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}_submissions_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
}