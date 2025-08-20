# MinIO Setup Guide (Pure MinIO)

MinIO adalah object storage server yang kompatibel dengan Amazon S3 API. Panduan ini akan membantu Anda mengatur MinIO murni di VPS Anda sendiri, tanpa menggunakan AWS sama sekali.

## 1. Instalasi MinIO di VPS

### Menggunakan Docker (Recommended)

```bash
# Pull MinIO image
docker pull minio/minio

# Buat direktori untuk data
mkdir -p ~/minio/data

# Jalankan MinIO
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin123" \
  minio/minio server /data --console-address ":9001"
```

### Instalasi Manual

```bash
# Download MinIO binary
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Buat user dan direktori
sudo useradd -r minio-user -s /sbin/nologin
sudo mkdir /usr/local/share/minio
sudo mkdir /etc/minio
sudo chown minio-user:minio-user /usr/local/share/minio
sudo chown minio-user:minio-user /etc/minio

# Buat file konfigurasi
sudo nano /etc/default/minio
```

Isi file `/etc/default/minio`:
```bash
MINIO_VOLUMES="/usr/local/share/minio/"
MINIO_OPTS="-C /etc/minio --address :9000 --console-address :9001"
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

## 2. Konfigurasi Firewall

```bash
# Buka port 9000 (API) dan 9001 (Console)
sudo ufw allow 9000
sudo ufw allow 9001
```

## 3. Setup SSL/HTTPS (Optional tapi Recommended)

### Menggunakan Nginx sebagai Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name console.your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Akses MinIO Console

1. Buka browser dan akses `http://your-vps-ip:9001`
2. Login dengan:
   - Username: `minioadmin`
   - Password: `minioadmin123`

## 5. Buat Bucket

1. Di MinIO Console, klik "Create Bucket"
2. Nama bucket: `alur-ai`
3. Klik "Create Bucket"

## 6. Konfigurasi CORS

1. Pilih bucket `alur-ai`
2. Masuk ke tab "Configuration"
3. Scroll ke "CORS Configuration"
4. Tambahkan konfigurasi berikut:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:9003", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 7. Update Environment Variables

Update file `.env.local` di project Anda:

```env
# MinIO Configuration
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME=alur-ai
NEXT_PUBLIC_MINIO_ENDPOINT=https://your-vps-ip:9000
# atau jika menggunakan domain: https://your-domain.com
```

## 8. Testing

1. Restart aplikasi Next.js
2. Coba upload file
3. Periksa di MinIO Console apakah file berhasil terupload

## Troubleshooting

### Error: "Failed to fetch"
- Pastikan CORS sudah dikonfigurasi dengan benar
- Periksa firewall VPS (port 9000 harus terbuka)
- Pastikan MinIO service berjalan

### Error: "Access Denied"
- Periksa kredensial di `.env.local`
- Pastikan bucket sudah dibuat
- Periksa permission bucket

### Error: "Connection Refused"
- Pastikan MinIO service berjalan: `docker ps` atau `systemctl status minio`
- Periksa port yang digunakan
- Periksa firewall

## Keuntungan MinIO vs AWS S3

✅ **Kontrol penuh** - Server di VPS Anda sendiri
✅ **Biaya lebih murah** - Tidak ada biaya per request
✅ **Latensi rendah** - Server dekat dengan aplikasi
✅ **Kompatibel S3** - Menggunakan API yang sama
✅ **Setup mudah** - Instalasi dalam hitungan menit
✅ **No vendor lock-in** - Bisa migrasi kapan saja

## Monitoring dan Maintenance

### Backup Data
```bash
# Backup data MinIO
tar -czf minio-backup-$(date +%Y%m%d).tar.gz ~/minio/data/
```

### Update MinIO
```bash
# Jika menggunakan Docker
docker pull minio/minio:latest
docker stop minio
docker rm minio
# Jalankan ulang dengan image terbaru
```

### Monitoring Disk Space
```bash
# Cek penggunaan disk
df -h ~/minio/data/
```