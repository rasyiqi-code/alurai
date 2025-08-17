import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Bot, BarChart, Palette } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter mb-4">
              Bangun Formulir Percakapan Cerdas dengan AI
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl mb-8">
              Ubah deskripsi sederhana menjadi formulir interaktif yang menarik. AlurAI membuat pengumpulan data menjadi lebih mudah, lebih cepat, dan lebih manusiawi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/create">
                  Buat Formulir Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">
                  Masuk ke Akun
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Ubah Cara Anda Mengumpulkan Data</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                Fitur-fitur canggih yang dirancang untuk meningkatkan interaksi dan memberikan hasil.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">Pembuat Formulir AI</h3>
                  <p className="text-muted-foreground">
                    Cukup jelaskan kebutuhan Anda, dan biarkan AI kami yang membuat alur formulir percakapan yang sempurna untuk Anda.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Palette className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">Branding Kustom</h3>
                  <p className="text-muted-foreground">
                    Sesuaikan tampilan dan nuansa formulir Anda dengan warna, logo, dan tata letak kustom agar sesuai dengan merek Anda.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center flex flex-col items-center">
                   <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">Analitik Mendalam</h3>
                  <p className="text-muted-foreground">
                    Lacak pengiriman, analisis data, dan dapatkan wawasan berharga melalui dasbor analitik kami yang intuitif.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Dipercaya oleh Para Profesional</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <Card className="flex flex-col justify-between">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">"AlurAI mengubah cara kami mengumpulkan feedback. Tingkat penyelesaian survei kami meningkat 40%!"</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Jane Doe</p>
                      <p className="text-sm text-muted-foreground">Marketing Manager, TechCorp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
               <Card className="flex flex-col justify-between">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">"Proses onboarding klien kami menjadi jauh lebih lancar. Fitur auto-fill AI sangat menghemat waktu."</p>
                   <div className="flex items-center gap-4">
                    <Avatar>
                       <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person smiling" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Michael Smith</p>
                      <p className="text-sm text-muted-foreground">Freelance Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
               <Card className="flex flex-col justify-between">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">"Sangat mudah digunakan dan hasilnya terlihat profesional. Sangat direkomendasikan untuk bisnis apa pun."</p>
                   <div className="flex items-center gap-4">
                    <Avatar>
                       <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="business person" />
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Sarah Adams</p>
                      <p className="text-sm text-muted-foreground">Owner, Creative Agency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Siap untuk Memulai?</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
              Buat formulir pertama Anda dalam hitungan menit. Tidak perlu kartu kredit.
            </p>
            <Button asChild size="lg">
              <Link href="/create">
                Coba AlurAI Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 md:px-6 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AlurAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
