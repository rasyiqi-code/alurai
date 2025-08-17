'use client';
import { useState } from 'react';
import { Bot, Upload, ClipboardPaste, Wand2, File as FileIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { parseDataForSuggestionsAction } from '@/app/actions';
import { FormFlow, ExtractedPair } from '@/lib/types';
import { Spinner } from './spinner';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface Props {
  formFlow: FormFlow;
  onDataParsed: (data: ExtractedPair[]) => void;
}

export function DataParser({ formFlow, onDataParsed }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleParse = async () => {
    let inputData = pastedText;
    if (!inputData && file) {
      try {
        inputData = await file.text();
      } catch (e) {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the contents of the file.' });
        return;
      }
    }

    if (!inputData) {
      toast({ variant: 'destructive', title: 'No data provided', description: 'Please paste text or upload a file.' });
      return;
    }
    
    setIsLoading(true);
    const result = await parseDataForSuggestionsAction(inputData);
    setIsLoading(false);
    
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Parsing Error', description: result.error });
    } else {
      if (result.length > 0) {
        onDataParsed(result);
        toast({ title: 'Success', description: 'Information extracted. Please confirm the suggestions.' });
      } else {
        toast({ title: 'No Information Found', description: 'AI could not find any information to extract from the text.' });
      }
      setIsOpen(false);
      setPastedText('');
      setFile(null);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    // This is a common way to reset a file input, though it's a bit of a hack.
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          <Bot className="h-4 w-4 mr-2" /> Auto-fill with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Intelligent Data Parsing</DialogTitle>
          <DialogDescription>
            Paste a block of text or upload a file, and AI will attempt to find information to fill the form.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pasted-text"><ClipboardPaste className="inline-block h-4 w-4 mr-2" /> Paste Text</Label>
            <Textarea
              id="pasted-text"
              placeholder="Paste relevant information here..."
              className="min-h-32"
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">OR</div>
          <div className="space-y-2">
            <Label htmlFor="file-upload"><Upload className="inline-block h-4 w-4 mr-2" /> Upload File</Label>
            <Input id="file-upload" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
             {file && (
              <div className="text-sm text-muted-foreground flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2 truncate">
                    <FileIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
                    <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleParse} disabled={isLoading}>
            {isLoading ? <Spinner className='mr-2' /> : <Wand2 className="h-4 w-4 mr-2" />}
            Parse Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
