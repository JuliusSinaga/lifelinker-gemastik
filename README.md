# LifeLinker

LifeLinker adalah aplikasi berbasis web yang menghubungkan calon pendonor darah dengan pasien yang membutuhkan. Proyek ini terdiri dari dua bagian utama:
- **Frontend** (React.js)
- **Backend** (Go)

## Prasyarat (Prerequisites)

Sebelum menginstal dan menjalankan proyek ini, pastikan Anda telah menginstal perangkat lunak berikut:
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru direkomendasikan)
- [Go](https://golang.org/) (versi 1.20 atau lebih baru direkomendasikan)
- [PostgreSQL](https://www.postgresql.org/) (sebagai sistem manajemen basis data)
- Git

---

## 1. Instalasi Backend (Go)

Backend aplikasi ini dibangun menggunakan bahasa pemrograman Go (Golang) dan PostgreSQL sebagai basis datanya.

### Langkah-langkah:
1. Masuk ke direktori backend:
   ```bash
   cd apps/backend
   ```
2. Salin file konfigurasi *environment*:
   ```bash
   cp .env.example .env
   ```
   *(Atau ubah nama file `.env.example` menjadi `.env` secara manual di file explorer)*
3. Buka file `.env` dan sesuaikan variabel koneksi database serta konfigurasi lainnya (seperti Google OAuth dan SMTP Gmail) sesuai dengan kredensial lokal Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password_db_anda
   DB_NAME=nama_db_anda
   ```
4. Unduh semua dependensi Go:
   ```bash
   go mod tidy
   ```
5. Jalankan server backend:
   ```bash
   go run main.go
   ```
   Server backend secara default akan berjalan di `http://localhost:8080` (tergantung konfigurasi Anda).

---

## 2. Instalasi Frontend (React.js)

Frontend aplikasi ini dibangun dengan React.js.

### Langkah-langkah:
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd apps/frontend
   ```
2. Salin file konfigurasi *environment*:
   ```bash
   cp .env.example .env
   ```
   *(Sesuaikan isi `.env` frontend jika ada variabel API URL atau Google Client ID)*
3. Instal dependensi Node.js:
   ```bash
   npm install
   ```
4. Jalankan aplikasi frontend:
   ```bash
   npm start
   ```
   Aplikasi frontend akan terbuka secara otomatis di browser pada `http://localhost:3000`.

---

## Menjalankan Aplikasi Secara Penuh
Untuk menggunakan aplikasi secara normal, Anda harus membiarkan terminal yang menjalankan **Backend** (`go run main.go`) dan terminal yang menjalankan **Frontend** (`npm start`) berjalan secara bersamaan di *background*.
