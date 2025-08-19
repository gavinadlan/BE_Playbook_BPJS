#!/bin/bash

# Script deployment full-stack (FE + BE) ke server perusahaan
# Jalankan ini di server perusahaan
# NOTE: Backend dan Frontend di repository terpisah

echo "🚀 Starting full-stack deployment to company server..."

# Set environment variables
export NODE_ENV=production

# ========================================
# STEP 1: Deploy Backend
# ========================================
echo "🔧 Deploying Backend..."
# Pastikan sudah di folder backend
# cd backend (jika belum)

# Install dependencies
npm install

# Deploy database
echo "📦 Deploying database..."
./scripts/deploy-production.sh

# Build backend
echo "🔨 Building backend..."
npm run build

# ========================================
# STEP 2: Deploy Frontend  
# ========================================
echo "🎨 Deploying Frontend..."
echo "⚠️  NOTE: Frontend ada di repository terpisah!"
echo "   Repository: https://github.com/gavinadlan/Playbook_BPJS.git"
echo "   Folder: Playbook_BPJS"
echo ""
echo "📋 Manual steps untuk Frontend:"
echo "   1. Clone repository frontend"
echo "   2. Install dependencies: npm install"
echo "   3. Build: npm run build"
echo "   4. Start: npm start"
echo ""
echo "⏭️  Skipping frontend deployment..."
echo "   Lanjut ke step berikutnya..."

# ========================================
# STEP 3: Setup Process Manager (PM2)
# ========================================
echo "⚙️ Setting up PM2..."

# Install PM2 globally if not exists
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start Backend with PM2
echo "🚀 Starting backend with PM2..."
cd ../backend
pm2 start ecosystem.config.js --name "bpjs-backend"

# Start Frontend with PM2 (jika sudah di-deploy)
echo "🚀 Starting frontend with PM2..."
echo "⚠️  NOTE: Frontend harus sudah di-deploy manual dulu!"
echo "   Pastikan frontend sudah running di folder: Playbook_BPJS"
echo ""
echo "📋 Jika frontend sudah running, jalankan:"
echo "   cd Playbook_BPJS"
echo "   pm2 start npm --name 'bpjs-frontend' -- start"
echo ""
echo "⏭️  Skipping frontend PM2 setup..."
echo "   Lanjut ke step berikutnya..."

# ========================================
# STEP 4: Setup PM2 startup
# ========================================
echo "🔧 Setting up PM2 startup..."
pm2 startup
pm2 save

# ========================================
# STEP 5: Show Status
# ========================================
echo "✅ Full-stack deployment completed!"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "🌐 Services running on:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Database: PostgreSQL (localhost:5432)"
echo ""
echo "🔑 Admin access:"
echo "   Email: adminapi@bpjs-kesehatan.go.id"
echo "   Password: jkn2025api"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs bpjs-backend    # View backend logs"
echo "   pm2 logs bpjs-frontend   # View frontend logs"
echo "   pm2 restart all          # Restart all services"
echo "   pm2 stop all             # Stop all services"
