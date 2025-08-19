# 📚 How to Deploy BPJS Kesehatan API Documentation

> Panduan deployment project dokumentasi API BPJS Kesehatan yang saya buat untuk tim developer dan DevOps

---

## 📋 Daftar Isi

1. [Overview Project](#overview-project)
2. [Persiapan Server](#persiapan-server)
3. [Deployment Backend](#deployment-backend)
4. [Deployment Frontend](#deployment-frontend)
5. [Setup Database](#setup-database)
6. [Setup Nginx & Domain](#setup-nginx--domain)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Update & Maintenance](#update--maintenance)

---

## 📖 Overview Project

Project ini adalah **dokumentasi API BPJS Kesehatan** yang saya buat untuk memudahkan developer dalam mengintegrasikan sistem mereka dengan layanan BPJS Kesehatan. 

### 🎯 Fitur Utama:
- **📚 Dokumentasi API** - Swagger UI untuk semua layanan BPJS
- **🔐 Authentication** - JWT-based dengan role-based access
- **📋 PKS Management** - Upload dan approval dokumen PKS
- **👥 User Management** - Register, login, admin dashboard
- **🧪 Test API** - Interface untuk testing endpoint langsung
- **📱 Responsive Design** - Mobile-first dengan Next.js

### 🏗️ Arsitektur:
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Process Manager:** PM2
- **Web Server:** Nginx (optional)

### 📁 Repository Structure:
```
Backend:  https://github.com/gavinadlan/BE_Playbook_BPJS.git
Frontend: https://github.com/gavinadlan/Playbook_BPJS.git
```

---

## 🛠️ Persiapan Server

### Prerequisites
Sebelum deployment, pastikan server memiliki:
- ✅ Ubuntu 20.04+ / CentOS 8+ (saya recommend Ubuntu untuk kemudahan)
- ✅ Node.js v18+ (project ini menggunakan Next.js 15)
- ✅ PostgreSQL v13+ (untuk database user dan PKS)
- ✅ Git (untuk clone repository)
- ✅ Nginx (optional, untuk reverse proxy)
- ✅ Firewall yang dikonfigurasi (port 3000, 3001, 5432)

### 📦 Software & Dependencies yang Perlu Diinstall

**⚠️ PENTING:** Semua software ini harus diinstall di server **SEBELUM** deploy project!

#### **1. 🖥️ System Dependencies (Install Manual)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git nano vim htop
```

#### **2. 🟢 Node.js & npm (Install Manual)**
```bash
# Install Node.js v18+ (wajib untuk Next.js 15)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi instalasi
node --version  # Harus v18+
npm --version   # Harus v8+
```

#### **3. 🐘 PostgreSQL Database (Install Manual)**
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start dan enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verifikasi
sudo systemctl status postgresql
```

#### **4. 🔨 Build Tools (Install Manual)**
```bash
# Install build essentials (untuk compile native modules)
sudo apt install -y build-essential python3

# Install specific tools yang diperlukan
sudo apt install -y libpq-dev
```

#### **5. 🌐 Nginx Web Server (Install Manual - Optional)**
```bash
# Install Nginx
sudo apt install -y nginx

# Start dan enable
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### **6. 🔐 SSL Certificate Tools (Install Manual - Optional)**
```bash
# Install Certbot untuk SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### **7. ⚙️ PM2 Process Manager (Install Manual)**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verifikasi
pm2 --version
```

### 📋 **Project Dependencies (Otomatis via npm install)**

**✅ TIDAK PERLU INSTALL MANUAL** - Akan terinstall otomatis saat deploy:

#### **Backend Dependencies:**
- **@prisma/client** - Database ORM
- **express** - Web framework
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload
- **nodemailer** - Email service
- **socket.io** - Real-time communication
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **zod** - Schema validation

#### **Frontend Dependencies:**
- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - CSS framework
- **framer-motion** - Animations
- **axios** - HTTP client
- **socket.io-client** - Real-time client

### 🚀 **Script Install Dependencies Lengkap**

**Buat file `install-dependencies.sh` di server:**

```bash
#!/bin/bash
# install-dependencies.sh

echo "🚀 Installing dependencies for BPJS Kesehatan project..."

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install basic tools
echo "🔧 Installing basic tools..."
sudo apt install -y curl wget git nano vim htop

# Install Node.js
echo "🟢 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install build tools
echo "🔨 Installing build tools..."
sudo apt install -y build-essential python3 libpq-dev

# Install Nginx (optional)
echo "🌐 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install SSL tools (optional)
echo "🔐 Installing SSL tools..."
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 globally
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Verifikasi installations
echo "✅ Verifying installations..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PostgreSQL: $(sudo systemctl status postgresql | grep Active)"
echo "Nginx: $(sudo systemctl status nginx | grep Active)"
echo "PM2: $(pm2 --version)"

echo "🎉 All dependencies installed successfully!"
```

**Cara pakai:**
```bash
# Berikan permission execute
chmod +x install-dependencies.sh

# Jalankan script
./install-dependencies.sh
```

### 1.1 Install Dependencies dengan Script (Recommended)
```bash
# Jalankan script install dependencies yang sudah dibuat
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 1.2 Install Manual (Jika tidak pakai script)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git nano vim htop

# Install Node.js v18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install build tools
sudo apt install -y build-essential python3 libpq-dev

# Install Nginx (optional)
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo npm install -g pm2
```

### 1.3 Verifikasi Installations
```bash
# Cek semua software yang terinstall
node --version      # Harus v18+
npm --version       # Harus v8+
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 --version
```

---

## 🚀 Deployment Backend

### 2.1 Clone Repository Backend
```bash
# Buat folder untuk project
mkdir -p /var/www/bpjs-kesehatan
cd /var/www/bpjs-kesehatan

# Clone repository backend
git clone https://github.com/gavinadlan/BE_Playbook_BPJS.git backend
cd backend
```

### 2.2 Setup Environment Variables
```bash
# Buat file environment production
cp .env.example .env.production

# Edit file environment
nano .env.production
```

**Isi file `.env.production`:**
```env
# Database Configuration
NODE_ENV=production
DATABASE_URL="postgresql://bpjs_user:your_password@localhost:5432/bpjs_kesehatan?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=12h

# Server Configuration
BASE_URL=http://localhost:3001
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Email Configuration (untuk reset password, verifikasi email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2.3 Deploy Backend dengan Script Otomatis
```bash
# Berikan permission execute
chmod +x scripts/deploy-full-stack.sh

# Jalankan script deployment
./scripts/deploy-full-stack.sh
```

**Yang akan terjadi otomatis:**
1. ✅ Install dependencies Node.js
2. ✅ Setup database dengan Prisma (saya pakai Prisma untuk kemudahan ORM)
3. ✅ Backup data (jika ada) - script ini saya buat untuk aman
4. ✅ Deploy migrations
5. ✅ Restore data penting (user dan PKS)
6. ✅ Buat admin default (adminapi@bpjs-kesehatan.go.id)
7. ✅ Build TypeScript
8. ✅ Setup PM2 untuk process management
9. ✅ Start backend service

### 2.4 Verifikasi Backend
```bash
# Cek status PM2
pm2 status

# Cek logs backend
pm2 logs bpjs-backend

# Test API
curl http://localhost:3001/api/users
```

---

## 🎨 Deployment Frontend

### 3.1 Clone Repository Frontend
```bash
# Kembali ke folder utama
cd /var/www/bpjs-kesehatan

# Clone repository frontend (ini repository terpisah yang saya buat)
git clone https://github.com/gavinadlan/Playbook_BPJS.git frontend
cd frontend
```

### 3.2 Setup Environment Variables Frontend
```bash
# Buat file environment production
nano .env.production
```

**Isi file `.env.production`:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3.3 Deploy Frontend
```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Start dengan PM2
pm2 start npm --name "bpjs-frontend" -- start
```

### 3.4 Verifikasi Frontend
```bash
# Cek status PM2
pm2 status

# Cek logs frontend
pm2 logs bpjs-frontend

# Test frontend
curl http://localhost:3000
```

---

## 🗄️ Setup Database

### 4.1 Buat Database dan User
```bash
# Login ke PostgreSQL sebagai superuser
sudo -u postgres psql

# Buat database (saya pakai nama yang mudah diingat)
CREATE DATABASE bpjs_kesehatan;

# Buat user (jangan lupa ganti password yang aman)
CREATE USER bpjs_user WITH PASSWORD 'your_secure_password';

# Berikan privileges (user ini akan akses database)
GRANT ALL PRIVILEGES ON DATABASE bpjs_kesehatan TO bpjs_user;

# Keluar dari PostgreSQL
\q
```

### 4.2 Test Koneksi Database
```bash
# Test koneksi dengan user baru
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT version();"
```

### 4.3 Verifikasi Data
```bash
# Cek tabel yang ada
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "\dt"

# Cek jumlah user
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT COUNT(*) FROM \"User\";"

# Cek admin
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT name, email, role FROM \"User\" WHERE role = 'ADMIN';"
```

---

## 🌐 Setup Nginx & Domain

### 5.1 Install Nginx
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 Konfigurasi Nginx
```bash
# Buat file konfigurasi
sudo nano /etc/nginx/sites-available/bpjs-kesehatan
```

**Isi konfigurasi:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (Next.js) - ini yang saya buat untuk dokumentasi API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API - untuk authentication dan PKS management
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload files - untuk dokumen PKS yang diupload user
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression - untuk optimasi performa
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 5.3 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bpjs-kesehatan /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5.4 Setup SSL (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📊 Monitoring & Maintenance

### 6.1 Setup PM2 Startup
```bash
# Setup PM2 untuk auto-restart saat server reboot
pm2 startup
pm2 save
```

### 6.2 Monitoring Commands
```bash
# Cek status semua service
pm2 status

# Cek logs real-time
pm2 logs

# Cek logs specific service
pm2 logs bpjs-backend
pm2 logs bpjs-frontend

# Cek penggunaan resources
pm2 monit
```

### 6.3 Database Monitoring
```bash
# Cek koneksi database
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT version();"

# Cek ukuran database
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT pg_size_pretty(pg_database_size('bpjs_kesehatan'));"

# Cek jumlah data
psql -h localhost -U bpjs_user -d bpjs_kesehatan -c "SELECT 'Users:' as table_name, COUNT(*) as count FROM \"User\" UNION ALL SELECT 'PKS:' as table_name, COUNT(*) as count FROM \"Pks\";"
```

### 6.4 System Monitoring
```bash
# Cek penggunaan disk
df -h

# Cek penggunaan memory
free -h

# Cek penggunaan CPU
top

# Cek service status
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## 🔧 Troubleshooting

### 7.1 Backend Issues

**Problem: Backend tidak start**
```bash
# Cek logs
pm2 logs bpjs-backend

# Restart service
pm2 restart bpjs-backend

# Cek port
netstat -tlnp | grep :3001
```

**Problem: Database connection error**
```bash
# Cek PostgreSQL status
sudo systemctl status postgresql

# Cek koneksi database
psql -h localhost -U bpjs_user -d bpjs_kesehatan

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 7.2 Frontend Issues

**Problem: Frontend tidak load**
```bash
# Cek logs
pm2 logs bpjs-frontend

# Restart service
pm2 restart bpjs-frontend

# Cek port
netstat -tlnp | grep :3000
```

**Problem: API calls failed**
```bash
# Cek CORS configuration
# Pastikan CORS_ORIGIN di backend sesuai dengan domain frontend

# Test API langsung
curl http://localhost:3001/api/users
```

### 7.3 Nginx Issues

**Problem: 502 Bad Gateway**
```bash
# Cek Nginx logs
sudo tail -f /var/log/nginx/error.log

# Cek service status
pm2 status

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

### 7.4 Common Solutions

**Reset PM2:**
```bash
pm2 delete all
pm2 start ecosystem.config.js --name "bpjs-backend"
cd /var/www/bpjs-kesehatan/frontend
pm2 start npm --name "bpjs-frontend" -- start
pm2 save
```

**Reset Database:**
```bash
cd /var/www/bpjs-kesehatan/backend
npx prisma migrate reset --force
./scripts/deploy-production.sh
```

---

## 🔄 Update & Maintenance

### 8.1 Update Backend
```bash
cd /var/www/bpjs-kesehatan/backend

# Pull changes
git pull origin main

# Deploy update
./scripts/deploy-full-stack.sh
```

### 8.2 Update Frontend
```bash
cd /var/www/bpjs-kesehatan/frontend

# Pull changes
git pull origin main

# Install dependencies (jika ada perubahan)
npm install

# Build ulang
npm run build

# Restart service
pm2 restart bpjs-frontend
```

### 8.3 Backup Database
```bash
# Backup database
pg_dump -h localhost -U bpjs_user bpjs_kesehatan > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database (jika diperlukan)
psql -h localhost -U bpjs_user bpjs_kesehatan < backup_file.sql
```

### 8.4 Backup Files
```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/bpjs-kesehatan/backend/uploads

# Backup environment files
cp /var/www/bpjs-kesehatan/backend/.env.production /var/www/bpjs-kesehatan/backend/.env.production.backup
cp /var/www/bpjs-kesehatan/frontend/.env.production /var/www/bpjs-kesehatan/frontend/.env.production.backup
```

---

## 🔑 Admin Access

Setelah deployment berhasil, admin default akan tersedia (ini yang saya set di script):

- **Email:** `adminapi@bpjs-kesehatan.go.id`
- **Password:** `jkn2025api`
- **Role:** ADMIN
- **Status:** Verified

### Login URL:
- **Local:** http://localhost:3000/login
- **Production:** https://your-domain.com/login

### 🎯 Fitur Admin:
- **Dashboard** - Lihat statistik user dan PKS
- **User Management** - Kelola user yang register
- **PKS Approval** - Review dan approve/reject dokumen PKS
- **API Categories** - Kelola kategori dokumentasi API
- **FAQ Management** - Kelola FAQ

---

## 📞 Support

Jika mengalami masalah saat deployment:

1. **Cek logs** terlebih dahulu (saya selalu cek logs dulu)
2. **Restart services** jika diperlukan
3. **Verifikasi environment variables** (ini yang sering jadi masalah)
4. **Cek koneksi database** (pastikan PostgreSQL running)
5. **Hubungi saya** jika masalah berlanjut (saya yang buat project ini)

### 📧 Contact:
- **Email:** gavinadlanhid@gmail.com
- **GitHub:** https://github.com/gavinadlan

---

## 📝 Checklist Deployment

### ✅ Prerequisites
- [ ] Server dengan Ubuntu 20.04+ / CentOS 8+
- [ ] **Node.js v18+** terinstall (wajib untuk Next.js 15)
- [ ] **PostgreSQL v13+** terinstall (database)
- [ ] **Git** terinstall (clone repository)
- [ ] **Build tools** terinstall (build-essential, python3, libpq-dev)
- [ ] **Nginx** terinstall (optional, untuk reverse proxy)
- [ ] **PM2** terinstall (process manager)
- [ ] **Firewall** dikonfigurasi (port 3000, 3001, 5432)

### ✅ Backend
- [ ] Repository backend di-clone
- [ ] Environment variables dikonfigurasi
- [ ] Script deployment dijalankan
- [ ] Database ter-setup
- [ ] Backend running di port 3001

### ✅ Frontend
- [ ] Repository frontend di-clone
- [ ] Environment variables dikonfigurasi
- [ ] Dependencies terinstall
- [ ] Build production berhasil
- [ ] Frontend running di port 3000

### ✅ Database
- [ ] Database `bpjs_kesehatan` terbuat
- [ ] User `bpjs_user` terbuat
- [ ] Privileges diberikan
- [ ] Migrations ter-deploy
- [ ] Admin default terbuat

### ✅ Nginx (Optional)
- [ ] Konfigurasi Nginx dibuat
- [ ] Site enabled
- [ ] SSL certificate ter-setup (jika diperlukan)
- [ ] Domain pointing ke server

### ✅ Monitoring
- [ ] PM2 startup ter-setup
- [ ] Services auto-restart
- [ ] Logs monitoring aktif
- [ ] Backup strategy ter-setup

---

*Dokumentasi ini saya buat untuk memudahkan deployment dan maintenance project dokumentasi API BPJS Kesehatan. Project ini saya develop untuk membantu developer dalam mengintegrasikan sistem mereka dengan layanan BPJS Kesehatan.*

*Update secara berkala jika ada perubahan pada struktur atau konfigurasi project.*

---

**Dibuat oleh:** Gavin Adlan Hidayat  
**Project:** BPJS Kesehatan API Documentation  
**Tanggal:** 2025
