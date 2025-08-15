import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { List, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="p-2.5 border-b bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="text-primary-foreground" />
          <h1 className="text-xl font-bold tracking-tight font-headline">
            AlurAI
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/forms">
              <List className="mr-2 h-4 w-4" />
              Saved Forms
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
