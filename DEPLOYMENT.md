# Panduan Deployment SINTAS ke Vercel + Supabase

## Langkah 1: Setup Supabase Database

### 1.1 Buat Project di Supabase
1. Buka https://supabase.com
2. Klik "New Project"
3. Isi nama project dan password database
4. Pilih region terdekat (Singapore direkomendasikan)
5. Tunggu hingga project selesai dibuat

### 1.2 Buat Tabel Database (2 Cara)

#### Cara A: Menggunakan SQL Editor (REKOMENDASI)
1. Buka project Supabase Anda
2. Klik menu **SQL Editor** di sidebar kiri
3. Klik "New Query"
4. Copy seluruh isi file `prisma/supabase-init.sql`
5. Paste dan klik **Run**
6. Semua tabel dan data awal akan dibuat otomatis

#### Cara B: Menggunakan Prisma Migrate
1. Dapatkan connection string dari **Settings > Database**
2. Jalankan di lokal:
```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
export DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migration
npx prisma migrate deploy
```

### 1.3 Dapatkan Connection Strings
1. Buka **Settings > Database**
2. Di bagian **Connection string**, pilih **Transaction** (untuk DATABASE_URL)
3. Copy URL tersebut
4. Pilih **Session** (untuk DIRECT_URL)
5. Copy URL tersebut

Format URL:
```
# DATABASE_URL (untuk connection pooling - digunakan di Vercel)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# DIRECT_URL (untuk migrations)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

---

## Langkah 2: Upload ke GitHub

### 2.1 Inisialisasi Git
```bash
# Di folder project
git init
git add .
git commit -m "Initial commit: SINTAS application"
```

### 2.2 Buat Repository di GitHub
1. Buka https://github.com/new
2. Isi nama repository (contoh: `sintas`)
3. Klik "Create repository"

### 2.3 Push ke GitHub
```bash
git remote add origin https://github.com/[USERNAME]/sintas.git
git branch -M main
git push -u origin main
```

---

## Langkah 3: Deploy ke Vercel

### 3.1 Import Project
1. Buka https://vercel.com
2. Klik "Add New" > "Project"
3. Pilih repository `sintas` dari GitHub
4. Klik "Import"

### 3.2 Konfigurasi Environment Variables
Di halaman konfigurasi, tambahkan environment variables berikut:

| Name | Value | Keterangan |
|------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PWD]@...pooler.supabase.com:6543/postgres?pgbouncer=true` | Connection pooling |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PWD]@...pooler.supabase.com:5432/postgres` | Direct connection |
| `NEXTAUTH_SECRET` | `[random-string-32-char]` | Generate dengan: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://[your-app].vercel.app` | URL production Anda |
| `NODE_ENV` | `production` | Production mode |

### 3.3 Deploy
1. Klik "Deploy"
2. Tunggu hingga selesai
3. Buka aplikasi Anda

---

## Langkah 4: Login Pertama

Setelah aplikasi berjalan, login dengan kredensial default:
- **Email**: admin@sintas.com
- **Password**: admin123

⚠️ **PENTING**: Segera ganti password setelah login pertama!

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- Pastikan DATABASE_URL sudah diset di Vercel Environment Variables
- Pastikan menggunakan connection pooling URL (port 6543)

### Error: "PrismaClientInitializationError"
- Jalankan `npx prisma generate` sebelum build
- Pastikan schema.prisma menggunakan provider "postgresql"

### Error: "Can't reach database server"
- Periksa connection string
- Pastikan IP Vercel tidak diblokir di Supabase
- Supabase biasanya mengizinkan semua koneksi secara default

### Error di Migration
- Gunakan SQL Editor di Supabase untuk membuat tabel manual
- File `prisma/supabase-init.sql` sudah lengkap

---

## Struktur File Deployment

```
├── prisma/
│   ├── schema.prisma        # Schema PostgreSQL
│   └── supabase-init.sql    # SQL untuk Supabase Editor
├── vercel.json              # Konfigurasi Vercel
├── .env.example             # Template environment variables
└── DEPLOYMENT.md            # Dokumen ini
```

---

## Keamanan

1. **Ganti password default** setelah login pertama
2. **Jangan commit file .env** ke repository
3. **Gunakan NEXTAUTH_SECRET** yang unik dan kuat
4. **Aktifkan Row Level Security** di Supabase jika diperlukan

---

## Backup Database

Supabase menyediakan backup otomatis untuk plan berbayar. Untuk plan gratis:
1. Gunakan pg_dump untuk backup manual
2. Atau export data dari Supabase Dashboard

```bash
# Backup manual
pg_dump "postgresql://..." > backup.sql
```
