import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Header } from "@/components/header";
import { Logo } from "@/components/icons/logo";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
                <Logo className="h-10 w-10 text-primary" />
             </div>
            <CardTitle className="text-2xl font-headline">Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk mengakses akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login dengan Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Belum punya akun?{" "}
              <Link href="#" className="underline">
                Daftar
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
