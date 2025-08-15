'use client';

import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function ShareButton({ formId }: { formId: string }) {
  const { toast } = useToast();
  const shareLink = `${window.location.origin}/form/${formId}`;
  
  const handleShare = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Link disalin!',
      description: 'Tautan formulir telah disalin ke clipboard Anda.',
    });
  };

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="ml-2">
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
