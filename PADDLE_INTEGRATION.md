# Paddle Integration with RevenueCat

Implementasi ini mengintegrasikan Paddle Billing dengan RevenueCat untuk mengelola langganan dan pembayaran.

## Arsitektur

1. **Frontend**: Menggunakan Paddle Checkout untuk proses pembayaran
2. **Backend**: Webhook Paddle mengirim notifikasi ke RevenueCat
3. **Subscription Management**: RevenueCat mengelola status langganan

## Konfigurasi Environment Variables

Tambahkan variabel berikut ke `.env.local`:

```env
# Paddle Configuration
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_95c8c34a0deeadf9c6d5c3b4e2
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01jgqhqhqhqhqhqhqhqhqhqhqh
NEXT_PUBLIC_PADDLE_API_KEY=live_95c8c34a0deeadf9c6d5c3b4e2

# RevenueCat Configuration (for external integration with Paddle)
REVENUECAT_SECRET_API_KEY=sk_your_secret_api_key_here
NEXT_PUBLIC_REVENUECAT_APP_ID=app2de7aeb77c
```

## Setup Paddle

1. **Buat Produk di Paddle Dashboard**:
   - Login ke Paddle Dashboard
   - Buat produk untuk setiap plan (Basic, Pro, Enterprise)
   - Catat Price ID untuk setiap produk

2. **Update Price IDs**:
   Edit file `src/lib/paddle.ts` dan ganti placeholder price IDs:
   ```typescript
   paddlePriceId: 'pri_actual_paddle_price_id'
   ```

3. **Konfigurasi Webhook**:
   - Di Paddle Dashboard, tambahkan webhook endpoint:
   - URL: `https://yourdomain.com/api/webhook/paddle`
   - Events: `subscription.created`, `subscription.updated`, `transaction.completed`, `subscription.canceled`

## Setup RevenueCat

1. **Konfigurasi External Purchases**:
   - Login ke RevenueCat Dashboard
   - Buat produk yang sesuai dengan Paddle products
   - Konfigurasi entitlements untuk setiap produk

2. **API Keys**:
   - Gunakan Secret API Key untuk webhook
   - App ID tetap sama seperti sebelumnya

## File Structure

```
src/
├── lib/
│   ├── paddle.ts              # Konfigurasi dan fungsi Paddle
│   └── revenuecat.ts          # File lama (tidak digunakan)
├── components/
│   └── pricing.tsx            # Komponen pricing dengan Paddle
├── app/
│   ├── api/webhook/paddle/
│   │   └── route.ts           # Webhook handler Paddle
│   └── subscription/success/
│       └── page.tsx           # Halaman sukses pembayaran
```

## Flow Pembayaran

1. **User memilih plan** → Komponen Pricing
2. **Klik "Get Plan"** → `openPaddleCheckout()` dipanggil
3. **Paddle Checkout terbuka** → User melakukan pembayaran
4. **Pembayaran berhasil** → Redirect ke `/subscription/success`
5. **Paddle mengirim webhook** → `/api/webhook/paddle`
6. **Webhook memproses** → Kirim data ke RevenueCat
7. **RevenueCat update** → Status langganan aktif

## Testing

1. **Development Mode**:
   ```bash
   npm run dev
   ```

2. **Test Pricing Page**:
   - Buka `http://localhost:9002/pricing`
   - Pastikan Paddle loading berhasil
   - Test checkout flow

3. **Test Webhook** (gunakan ngrok untuk local testing):
   ```bash
   ngrok http 9002
   ```
   Kemudian update webhook URL di Paddle Dashboard

## Troubleshooting

### Paddle tidak initialize
- Periksa `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- Pastikan environment (`sandbox` atau `production`) benar

### Webhook error
- Periksa `PADDLE_WEBHOOK_SECRET`
- Pastikan signature verification berfungsi
- Check logs di `/api/webhook/paddle`

### RevenueCat integration error
- Periksa `REVENUECAT_SECRET_API_KEY`
- Pastikan App ID benar
- Verify product mapping antara Paddle dan RevenueCat

## Security Notes

1. **Jangan expose secret keys** di frontend
2. **Selalu verify webhook signatures**
3. **Gunakan HTTPS** untuk production
4. **Validate semua input** di webhook handler

## Production Deployment

1. **Update Environment Variables**:
   - Ganti `sandbox` ke `production`
   - Gunakan production API keys
   - Update webhook URLs

2. **Domain Configuration**:
   - Update success URL di Paddle checkout
   - Configure proper CORS settings
   - Setup SSL certificates

## Support

Untuk bantuan lebih lanjut:
- Paddle Documentation: https://developer.paddle.com/
- RevenueCat Documentation: https://docs.revenuecat.com/