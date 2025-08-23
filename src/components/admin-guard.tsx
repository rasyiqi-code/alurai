'use client';

import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from './spinner';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const userLoading = user === undefined;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userLoading) return;
      
      if (!user) {
        router.push('/handler/sign-in');
        return;
      }

      try {
        // Check if user is member of admin team
        const teams = await user.listTeams();
        
        const adminTeam = teams.find(team => 
          team.displayName === 'team_admin' || 
          team.displayName === 'admin' ||
          team.displayName === 'Admin' ||
          team.displayName === 'administrators'
        );
        
        if (adminTeam) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, userLoading, router]);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="max-w-md w-full">
          <Alert className="border-destructive">
            <AlertDescription className="text-center">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-destructive mb-2">Access Denied</h2>
                <p className="text-sm text-muted-foreground">
                  You don't have admin privileges to access this area.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/forms">Back to Dashboard</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}