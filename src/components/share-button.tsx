'use client';

import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import type { FormFlowData } from '@/lib/types';

export function ShareButton({ form }: { form: FormFlowData }) {
  const { toast } = useToast();
  
  const getShareLink = () => {
    if (typeof window === 'undefined') return '';
    if (form.slug) {
      return `${window.location.origin}/view/${form.slug}`;
    }
    return `${window.location.origin}/form/${form.id}`;
  };

  const handleShare = async () => {
    const shareLink = getShareLink();
    const shareData = {
      title: 'Check out this form',
      text: 'Fill out this form I created.',
      url: shareLink,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard if user cancels share dialog
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const shareLink = getShareLink();
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Link copied!',
      description: 'The form link has been copied to your clipboard.',
    });
  };

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="ml-2">
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
