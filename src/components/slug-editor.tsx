'use client';

import { useState } from 'react';
import type { FormFlowData } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { updateFormSlugAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from './spinner';
import { Check, X } from 'lucide-react';

interface Props {
  form: FormFlowData;
}

export function SlugEditor({ form }: Props) {
  const [slug, setSlug] = useState(form.slug || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!form.id) return;
    setIsLoading(true);
    const result = await updateFormSlugAction(form.id, slug);
    setIsLoading(false);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Error updating slug',
        description: result.error,
      });
    } else {
      toast({
        title: 'Slug updated!',
        description: 'Your form URL has been successfully updated.',
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Basic slug validation: lowercase, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
  };

  return (
    <div className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-medium">{form.title}</p>
        <p className="text-sm text-muted-foreground">
          {typeof window !== 'undefined' ? `${window.location.origin}/view/` : '/view/'}
          <strong>{slug || '...'}</strong>
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          value={slug}
          onChange={handleSlugChange}
          placeholder="e.g., contact-form"
          className="w-full sm:w-48"
        />
        <Button onClick={handleSave} disabled={isLoading} size="sm">
          {isLoading ? <Spinner className="mr-2" /> : <Check className="mr-2" />}
          Save
        </Button>
      </div>
    </div>
  );
}
