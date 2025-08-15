import { Logo } from '@/components/icons/logo';

export function Header() {
  return (
    <header className="p-2.5 border-b bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="text-primary-foreground" />
        <h1 className="text-xl font-bold tracking-tight font-headline">
          AlurAI
        </h1>
      </div>
    </header>
  );
}
