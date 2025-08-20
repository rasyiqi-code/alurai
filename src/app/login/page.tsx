'use client';

import { useEffect } from 'react';
import { Header } from "@/components/header";
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { SignIn } from '@stackframe/stack';

export default function LoginPage() {
  const user = useUser();
  const router = useRouter();
  const loading = user === undefined;

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/forms');
    }
  }, [user, loading, router]);

  // Don't show login if user is already authenticated
  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
