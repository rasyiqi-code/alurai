# Fitur yang Akan Datang (Coming Soon)

Dokumen ini melacak fitur-fitur utama yang direncanakan untuk implementasi di masa mendatang untuk aplikasi AlurAI.

### 1. Fungsionalitas Unggah File Penuh
- **Status:** Saat ini, aplikasi hanya menyimpan nama file sebagai placeholder di Firestore.
- **Rencana:** Mengimplementasikan unggahan file yang sebenarnya ke layanan penyimpanan cloud (seperti Firebase Storage). Ini akan menyimpan file secara aman dan menghasilkan URL yang dapat diakses yang akan disimpan di Firestore, memungkinkan pengguna untuk mengunduh kembali file yang dikirimkan.

### 2. Tampilan Data Submission
- **Status:** Halaman detail analytics untuk setiap formulir saat ini menampilkan pesan "Coming Soon".
- **Rencana:** Membangun fungsionalitas untuk mengambil dan menampilkan data submission yang sebenarnya dalam tabel di halaman analytics. Ini akan memungkinkan pengguna untuk melihat, menyortir, dan mengekspor semua jawaban yang diterima untuk formulir mereka.

### 3. Dukungan Custom Domain
- **Status:** UI di halaman Pengaturan ada tetapi dinonaktifkan dan ditandai sebagai "Coming Soon".
- **Rencana:** Mengimplementasikan logika backend yang diperlukan untuk memungkinkan pengguna memetakan domain kustom mereka sendiri (misalnya, `forms.yourcompany.com`) ke aplikasi, memberikan pengalaman yang lebih bermerek.
