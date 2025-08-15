import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { List } from 'lucide-react';

export function Header() {
  return (
    <header className="p-2.5 border-b bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="text-primary-foreground" />
          <h1 className="text-xl font-bold tracking-tight font-headline">
            AlurAI
          </h1>
        </div>
        <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
          <Link href="/forms">
            <List className="mr-2 h-4 w-4" />
            Formulir Tersimpan
          </Link>
        </Button>
      </div>
    </header>
  );
}
