'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { List, Link as LinkIcon, BarChart, Palette, LogIn, LogOut, User as UserIcon, Menu, Database, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useUser, useStackApp } from '@stackframe/stack';
import { ThemeToggle } from './theme-toggle';
import { SubscriptionStatus } from './subscription-status';

export function Header() {
  const user = useUser();
  const stackApp = useStackApp();
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await user?.signOut();
  };

  return (
    <header className="py-2 px-2.5 border-b bg-primary text-primary-foreground sticky top-0 z-50 min-h-[60px]">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-3 h-full">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="text-primary-foreground" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight font-headline">
              AlurAI
            </h1>
            <span className="text-xs font-medium bg-white/20 text-primary-foreground px-2 py-1 rounded-full border border-white/30">
              BETA
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground py-2 px-3">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground py-2 px-3">
                <Link href="/forms">
                  <List className="mr-2 h-4 w-4" />
                  Forms
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground py-2 px-3">
                <Link href="/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground py-2 px-3">
                <Link href="/submissions">
                  <Database className="mr-2 h-4 w-4" />
                  Submissions
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground py-2 px-3">
                <Link href="/custom-url-domain">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Custom URL
                </Link>
              </Button>

              {/* Subscription Status Badge */}
              <SubscriptionStatus variant="header" />
              
              {/* Account Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground p-1 rounded-full">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                     <div className={`h-8 w-8 rounded-full bg-white/20 flex items-center justify-center ${user?.profileImageUrl ? 'hidden' : 'block'}`}>
                       <UserIcon className="h-4 w-4" />
                     </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    Account Menu
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                    <Link href="/handler/account-settings" className="flex items-center w-full">
                      <UserIcon className="mr-3 h-4 w-4 text-blue-500" />
                      <span className="font-medium">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem className="flex items-center justify-between rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                    <div className="flex items-center">
                      <div className="mr-3 h-4 w-4 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      </div>
                      <span className="font-medium">Theme</span>
                    </div>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0">
                <Link href="/sign-up">
                    <Palette className="mr-2 h-4 w-4" /> Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
                <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Subscription Status for mobile */}
              <SubscriptionStatus variant="header" />
              
              {/* Account Dropdown for mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground px-2">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
                  <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                    <Link href="/handler/account-settings" className="flex items-center w-full">
                      <UserIcon className="mr-3 h-4 w-4 text-blue-500" />
                      <span className="font-medium">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                    <div className="flex items-center">
                      <div className="mr-3 h-4 w-4 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                      </div>
                      <span className="font-medium">Theme</span>
                    </div>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground px-3">
                <Link href="/login">
                  <LogIn className="mr-1 h-4 w-4" /> Login
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Horizontal Navigation Bar */}
      {isLoggedIn && (
        <div className="md:hidden border-t border-white/20 bg-primary/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
             <div className="flex items-center justify-center gap-0.5 overflow-x-auto scrollbar-hide pb-1 min-h-[20px]">
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground whitespace-nowrap flex-shrink-0 py-1 px-2 h-6">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1 h-3 w-3" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground whitespace-nowrap flex-shrink-0 py-1 px-2 h-6">
                <Link href="/forms">
                  <List className="mr-1 h-3 w-3" />
                  Forms
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground whitespace-nowrap flex-shrink-0 py-1 px-2 h-6">
                <Link href="/analytics">
                  <BarChart className="mr-1 h-3 w-3" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground whitespace-nowrap flex-shrink-0 py-1 px-2 h-6">
                <Link href="/submissions">
                  <Database className="mr-1 h-3 w-3" />
                  Submissions
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground whitespace-nowrap flex-shrink-0 py-1 px-2 h-6">
                <Link href="/custom-url-domain">
                  <LinkIcon className="mr-1 h-3 w-3" />
                  Custom URL
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
