# Fitur yang Akan Datang (Coming Soon)

Dokumen ini melacak fitur-fitur utama yang direncanakan untuk implementasi di masa mendatang untuk aplikasi AlurAI.

### 1. Fungsionalitas Unggah File ke Google Drive (Implementasi Manual)
- **Status:** Saat ini, aplikasi hanya menyimpan nama file sebagai placeholder di Firestore.
- **Rencana:** Mengimplementasikan unggahan file yang sebenarnya ke Google Drive. Ini akan memerlukan beberapa langkah yang akan dilakukan secara manual:

#### Panduan Implementasi Manual:

1.  **Pengaturan Google Cloud Console:**
    *   Buka [Google Cloud Console](https://console.cloud.google.com/).
    *   Pastikan Anda berada di proyek yang benar.
    *   Buka "APIs & Services" > "Enabled APIs & services".
    *   Klik "+ ENABLE APIS AND SERVICES" dan cari "Google Drive API", lalu aktifkan.
    *   Buka "APIs & Services" > "Credentials".
    *   Buat kredensial baru: Klik "+ CREATE CREDENTIALS" dan pilih "OAuth client ID".
    *   Konfigurasikan "OAuth consent screen" jika Anda belum melakukannya. Anda perlu menentukan nama aplikasi dan cakupan (scope) yang diperlukan. Untuk unggah file, Anda akan memerlukan scope seperti `https://www.googleapis.com/auth/drive.file`.
    *   Pilih "Web application" sebagai tipe aplikasi.
    *   Tambahkan "Authorized redirect URIs". Ini adalah URL di aplikasi Anda yang akan menangani respons setelah pengguna memberikan izin, misalnya `http://localhost:9002/api/auth/callback/google`.
    *   Simpan Client ID dan Client Secret Anda dengan aman di file `.env.local`.

2.  **Logika Backend (di Server Action Next.js):**
    *   Anda akan memerlukan pustaka klien Google API untuk Node.js. Instal dengan `npm install googleapis`.
    *   **Alur Otentikasi (OAuth 2.0):**
        *   Buat server action yang menghasilkan URL otentikasi Google menggunakan Client ID dan scope yang telah Anda tentukan.
        *   Arahkan pengguna ke URL tersebut dari frontend.
        *   Setelah pengguna memberikan izin, Google akan mengarahkan mereka kembali ke "redirect URI" Anda dengan kode otorisasi.
        *   Buat route handler (misalnya, di `src/app/api/auth/callback/google/route.ts`) untuk menangani callback ini. Di sini, tukarkan kode otorisasi dengan *access token* dan *refresh token*.
        *   Simpan token ini dengan aman, idealnya terkait dengan data pengguna.
    *   **Logika Unggah File:**
        *   Buat server action baru untuk menangani unggahan file.
        *   Action ini akan menerima data file dari frontend.
        *   Gunakan *access token* yang telah disimpan untuk menginisialisasi klien Google Drive API.
        *   Gunakan metode `files.create` dari API untuk mengunggah file. Anda perlu menyediakan metadata file (seperti nama file) dan konten file itu sendiri.
        *   Setelah berhasil, API akan mengembalikan ID file di Google Drive. Simpan ID ini di Firestore, bukan hanya nama file.

3.  **Perubahan Frontend:**
    *   Modifikasi komponen formulir (`src/components/conversational-form.tsx`) untuk mengirim data file ke server action unggahan Anda.
    *   Anda mungkin perlu menangani file sebagai `FormData` untuk mengirimkannya dengan benar ke backend.

Semoga berhasil dengan implementasi manualnya! Ini adalah proyek belajar yang sangat bagus.

### 2. Tampilan Data Submission
- **Status:** Halaman detail analytics untuk setiap formulir saat ini menampilkan pesan "Coming Soon".
- **Rencana:** Membangun fungsionalitas untuk mengambil dan menampilkan data submission yang sebenarnya dalam tabel di halaman analytics. Ini akan memungkinkan pengguna untuk melihat, menyortir, dan mengekspor semua jawaban yang diterima untuk formulir mereka.

### 3. Dukungan Custom Domain
- **Status:** UI di halaman Pengaturan ada tetapi dinonaktifkan dan ditandai sebagai "Coming Soon".
- **Rencana:** Mengimplementasikan logika backend yang diperlukan untuk memungkinkan pengguna memetakan domain kustom mereka sendiri (misalnya, `forms.yourcompany.com`) ke aplikasi, memberikan pengalaman yang lebih bermerek.
