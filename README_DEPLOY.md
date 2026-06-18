# AR Collection Assistant — Panduan Deploy

## 1. Setup Environment Variables

Buat file `.env` di root project (copy dari `.env.example`):

```env
# Database MySQL
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/ar_collection"

# Auth secret — generate dengan: openssl rand -hex 32
AUTH_SECRET="isi-dengan-random-string-minimal-32-karakter"

# Login credentials
APP_USERNAME="dwiky"
APP_PASSWORD="password-aman-kamu"
```

> **Generate AUTH_SECRET:**
> ```bash
> openssl rand -hex 32
> ```

---

## 2. Setup Database MySQL

### Buat database dan user

```sql
CREATE DATABASE ar_collection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ar_user'@'localhost' IDENTIFIED BY 'password-kamu';
GRANT ALL PRIVILEGES ON ar_collection.* TO 'ar_user'@'localhost';
FLUSH PRIVILEGES;
```

### Jalankan migration

```bash
npm run db:migrate
```

Atau langsung jalankan SQL dari:
```
prisma/migrations/20260617000000_init/migration.sql
prisma/migrations/20260618000000_sprint2_customers/migration.sql
```

---

## 3. Import Data Customer

Setelah database siap:

1. Buka halaman `/customers/import`
2. Siapkan file CSV atau Excel dengan format:

   | sales_code | sales_name | customer_name | pic_customer |
   |------------|------------|---------------|--------------|
   | SM001      | HENSON     | NATLAS REKARTHA | JOHN       |
   | SM002      | DADAN      | HEXINDO ADIPERKASA |          |

3. Upload file → Preview → Klik **Import**

---

## 4. Deploy ke Vercel

### Persiapan

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build
```

### Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Deploy via GitHub

1. Push ke GitHub repository
2. Import project di [vercel.com](https://vercel.com)
3. Set Environment Variables di Vercel dashboard:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `APP_USERNAME`
   - `APP_PASSWORD`
4. Klik **Deploy**

### Database di Vercel

Vercel **tidak menyediakan MySQL**. Gunakan salah satu layanan berikut:

| Layanan | Keterangan |
|---------|------------|
| **PlanetScale** | MySQL-compatible, gratis tier tersedia |
| **Railway** | MySQL standar, mudah setup |
| **Aiven** | MySQL cloud, ada free tier |
| **Neon** | Untuk PostgreSQL (ganti provider di schema.prisma) |

Contoh `DATABASE_URL` untuk PlanetScale:
```
DATABASE_URL="mysql://USER:PASSWORD@HOST/ar_collection?sslaccept=strict"
```

---

## 5. Backup Data

Setelah login, buka halaman **/settings/backup**:

- **Export Activities** — semua data collection activities
- **Export Customers & Sales** — master data customer
- **Export All Data** — semua data dalam satu file Excel

File di-download langsung ke perangkat dalam format `.xlsx`.

---

## Checklist Sebelum Deploy

- [ ] `DATABASE_URL` sudah diisi dengan koneksi yang valid
- [ ] `AUTH_SECRET` sudah diganti dengan nilai random
- [ ] `APP_USERNAME` dan `APP_PASSWORD` sudah diubah dari default
- [ ] Migration database sudah dijalankan
- [ ] Test login berhasil
- [ ] Test tambah aktivitas berhasil
- [ ] Test import customer berhasil
- [ ] Test export data berhasil
