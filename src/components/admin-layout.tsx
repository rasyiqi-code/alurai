'use client';

import { AdminGuard } from './admin-guard';
import { AdminHeader } from './admin-header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <AdminHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}