'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Pembayaran Dibatalkan
          </CardTitle>
          <CardDescription>
            Proses pembayaran telah dibatalkan. Tidak ada tagihan yang dikenakan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Jangan khawatir, Anda dapat mencoba lagi kapan saja.</p>
            <p>Jika Anda mengalami masalah, silakan hubungi dukungan kami.</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/pricing')} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Halaman Harga
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Pergi ke Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}