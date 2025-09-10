import { HeaderWrapper } from '@/components/header-wrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderWrapper />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
