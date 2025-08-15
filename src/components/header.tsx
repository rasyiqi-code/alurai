import { Logo } from '@/components/icons/logo';

export function Header() {
  return (
    <header className="p-2 border-b bg-card">
      <div className="container mx-auto flex items-center gap-3">
        <Logo />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          AlurAI
        </h1>
      </div>
    </header>
  );
}
