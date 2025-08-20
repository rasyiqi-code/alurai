import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";
import { Header } from "@/components/header";

export default function Handler(props: unknown) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-6">
            <StackHandler app={stackServerApp} routeProps={props} fullPage={false} />
          </div>
        </div>
      </main>
    </div>
  );
}
