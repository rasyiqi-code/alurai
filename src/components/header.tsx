import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { List, Link as LinkIcon, BarChart, Settings, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu } from 'lucide-react';


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
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/forms">
              <List className="mr-2 h-4 w-4" />
              Saved Forms
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/analytics/overview">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Submission
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
            <Link href="/settings">
              <LinkIcon className="mr-2 h-4 w-4" />
              Custom URL
            </Link>
          </Button>
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/forms">
                            <List className="mr-2 h-4 w-4" />
                            <span>Saved Forms</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href="/analytics/overview">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href="/analytics">
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>Submission</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                         <Link href="/settings">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            <span>Custom URL</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
