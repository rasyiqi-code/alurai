'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { List, Link as LinkIcon, BarChart, Palette, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { useAuth } from './auth-provider';
import { auth } from '@/lib/firebase';

export function Header() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="p-2.5 border-b bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="text-primary-foreground" />
          <h1 className="text-xl font-bold tracking-tight font-headline">
            AlurAI
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                <Link href="/forms">
                  <List className="mr-2 h-4 w-4" />
                  Forms
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                <Link href="/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                <Link href="/custom-url-domain">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Custom URL
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                <Link href="/templates">
                  <Palette className="mr-2 h-4 w-4" />
                  Templates
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
              <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
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
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuItem asChild>
                          <Link href="/forms">
                              <List className="mr-2 h-4 w-4" />
                              <span>Saved Forms</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <Link href="/analytics">
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>Analytics</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <Link href="/custom-url-domain">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              <span>Custom URL</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                          <Link href="/templates">
                              <Palette className="mr-2 h-4 w-4" />
                              <span>Templates</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                     <DropdownMenuItem asChild>
                         <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Login</span>
                        </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
