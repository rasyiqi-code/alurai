'use client';
import { useState } from 'react';
import { Bot, Upload, ClipboardPaste, Wand2 } from 'lucide-react';
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
import { parseDataAction } from '@/app/actions';
import { FormFlow } from '@/lib/types';
import { Spinner } from './spinner';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface Props {
  formFlow: FormFlow;
  onDataParsed: (data: Record<string, any>) => void;
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
      inputData = await file.text();
    }

    if (!inputData) {
      toast({ variant: 'destructive', title: 'No data provided', description: 'Please paste text or upload a file.' });
      return;
    }
    
    setIsLoading(true);
    const result = await parseDataAction(formFlow, inputData);
    setIsLoading(false);
    
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Parsing Error', description: result.error });
    } else {
      onDataParsed(result);
      toast({ title: 'Success', description: 'Form fields have been pre-filled.' });
      setIsOpen(false);
      setPastedText('');
      setFile(null);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          <Bot className="h-4 w-4 mr-2" /> Auto-fill with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Intelligent Data Parsing</DialogTitle>
          <DialogDescription>
            Paste a block of text or upload a file, and AI will attempt to fill out the form for you.
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
