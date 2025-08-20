# Google Drive Integration Setup

Untuk mengaktifkan fitur upload file ke Google Drive, Anda perlu mengonfigurasi Google Cloud Console dan mengisi kredensial API di file `.env.local`.

## Langkah 1: Setup Google Cloud Console

### 1.1 Buat atau Pilih Project
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Catat Project ID untuk referensi

### 1.2 Aktifkan Google Drive API
1. Di Google Cloud Console, buka **APIs & Services** > **Library**
2. Cari "Google Drive API"
3. Klik pada "Google Drive API" dan klik **Enable**

### 1.3 Buat OAuth 2.0 Credentials
1. Buka **APIs & Services** > **Credentials**
2. Klik **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Jika diminta, konfigurasikan OAuth consent screen terlebih dahulu:
   - Pilih **External** untuk user type
   - Isi informasi aplikasi (nama, email, dll.)
   - Tambahkan scope: `../auth/drive.file` dan `../auth/userinfo.profile`
   - Tambahkan test users jika diperlukan
4. Untuk OAuth client ID:
   - Pilih **Web application**
   - Nama: "AIForm Google Drive Integration"
   - **Authorized redirect URIs**: `http://localhost:9003/api/auth/callback/google`
   - Klik **Create**

### 1.4 Download Credentials
1. Setelah dibuat, download file JSON credentials
2. Atau copy **Client ID** dan **Client Secret** dari halaman credentials

## Langkah 2: Konfigurasi Environment Variables

Buka file `.env.local` dan update nilai berikut:

```env
# Google Drive API Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:9003/api/auth/callback/google
NEXTAUTH_SECRET=your_random_secret_string_here
```

### Cara mendapatkan values:
- **GOOGLE_CLIENT_ID**: Copy dari Google Cloud Console > Credentials
- **GOOGLE_CLIENT_SECRET**: Copy dari Google Cloud Console > Credentials  
- **GOOGLE_REDIRECT_URI**: Sudah diset, pastikan sama dengan yang di Google Cloud Console
- **NEXTAUTH_SECRET**: Generate random string, bisa menggunakan: `openssl rand -base64 32`

## Langkah 3: Testing

1. Restart aplikasi Next.js
2. Buka form yang memiliki field file upload
3. Pilih file untuk diupload
4. Klik "Connect to Google Drive" untuk autentikasi
5. Setelah terkoneksi, klik "Upload to Google Drive"
6. File akan tersimpan di Google Drive user dan link akan disimpan di database

## Troubleshooting

### Error: "redirect_uri_mismatch"
```
net::ERR_ABORTED http://localhost:9003/handler/oauth-callback
```
**Solusi**: Update redirect URI di Google Cloud Console:
- Buka Google Cloud Console > APIs & Services > Credentials
- Edit OAuth 2.0 Client ID Anda
- Di "Authorized redirect URIs", pastikan Anda memiliki:
  ```
  http://localhost:9003/api/auth/callback/google
  ```
- Hapus URI lama seperti `/handler/oauth-callback`
- Simpan perubahan
- Pastikan `GOOGLE_REDIRECT_URI` di `.env.local` sama dengan yang dikonfigurasi di Google Cloud Console
- Pastikan tidak ada trailing slash di URL

### Error: "access_denied"
- Pastikan OAuth consent screen sudah dikonfigurasi
- Pastikan user sudah ditambahkan sebagai test user (jika masih dalam mode testing)

### Error: "invalid_client"
- Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` benar
- Pastikan credentials belum expired

### File tidak muncul di Google Drive
- Cek console browser untuk error
- Pastikan Google Drive API sudah diaktifkan
- Pastikan scope `https://www.googleapis.com/auth/drive.file` sudah ditambahkan

### Environment variables tidak terbaca
- Restart development server setelah mengupdate `.env.local`
- Verifikasi semua variabel Google OAuth sudah diset dengan benar

## Fitur yang Tersedia

- ✅ Koneksi ke Google Drive via OAuth 2.0
- ✅ Upload file ke Google Drive user
- ✅ Penyimpanan metadata file di Firestore
- ✅ Link publik untuk akses file
- ✅ Validasi file dan error handling
- ✅ UI yang user-friendly untuk file management

## Keamanan

- Access token disimpan dalam httpOnly cookies
- Refresh token untuk perpanjangan session otomatis
- File hanya bisa diakses oleh user yang mengupload
- Validasi file type dan size