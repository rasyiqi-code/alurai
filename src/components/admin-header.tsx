'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from './ui/button';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  Shield,
  Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useUser } from '@stackframe/stack';
import { ThemeToggle } from './theme-toggle';

export function AdminHeader() {
  const user = useUser();

  const handleLogout = async () => {
    await user?.signOut();
  };

  return (
    <header className="py-2 px-2.5 border-b bg-destructive text-destructive-foreground sticky top-0 z-50 min-h-[60px]">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-3 h-full">
        <Link href="/admin" className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-destructive-foreground" />
          <h1 className="text-xl font-bold tracking-tight font-headline">
            AlurAI Admin
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button asChild variant="ghost" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground py-2 px-3">
            <Link href="/admin">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground py-2 px-3">
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground py-2 px-3">
            <Link href="/admin/forms">
              <FileText className="mr-2 h-4 w-4" />
              Forms
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground py-2 px-3">
            <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          
          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground px-3">
                <UserIcon className="mr-2 h-4 w-4" />
                {user?.displayName || user?.primaryEmail || 'Admin'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/handler/account-settings" className="flex items-center w-full">
                  <UserIcon className="mr-3 h-4 w-4 text-blue-500" />
                  <span className="font-medium">Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/admin/settings" className="flex items-center w-full">
                  <Settings className="mr-3 h-4 w-4 text-green-500" />
                  <span className="font-medium">Admin Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/forms" className="flex items-center w-full">
                  <Home className="mr-3 h-4 w-4 text-purple-500" />
                  <span className="font-medium">User Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors text-destructive focus:text-destructive"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive-foreground hover:bg-white/20 hover:text-destructive-foreground px-2">
                <UserIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm">
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/admin" className="flex items-center w-full">
                  <Home className="mr-3 h-4 w-4 text-blue-500" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/admin/users" className="flex items-center w-full">
                  <Users className="mr-3 h-4 w-4 text-green-500" />
                  <span className="font-medium">Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/admin/forms" className="flex items-center w-full">
                  <FileText className="mr-3 h-4 w-4 text-purple-500" />
                  <span className="font-medium">Forms</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/admin/analytics" className="flex items-center w-full">
                  <BarChart3 className="mr-3 h-4 w-4 text-orange-500" />
                  <span className="font-medium">Analytics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/handler/account-settings" className="flex items-center w-full">
                  <UserIcon className="mr-3 h-4 w-4 text-blue-500" />
                  <span className="font-medium">Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors">
                <Link href="/forms" className="flex items-center w-full">
                  <Home className="mr-3 h-4 w-4 text-purple-500" />
                  <span className="font-medium">User Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-accent/80 transition-colors text-destructive focus:text-destructive"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}