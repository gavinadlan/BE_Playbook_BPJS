#!/bin/bash

# Script deployment untuk production server
# Jalankan ini di server perusahaan

echo "🚀 Starting production deployment..."

# Set environment variables
export NODE_ENV=production

# 1. Backup data dari database lama (jika ada)
echo "📦 Creating backup of existing data..."
psql $DATABASE_URL -f scripts/backup-data.sql

# 2. Deploy migrations
echo "🔄 Deploying database migrations..."
npx prisma migrate deploy

# 3. Restore data penting
echo "📥 Restoring important data..."
psql $DATABASE_URL -f scripts/restore-data.sql

# 4. Seed admin default
echo "👑 Seeding default admin..."
psql $DATABASE_URL -f scripts/seed-admin.sql

# 5. Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# 6. Build application
echo "🔨 Building application..."
npm run build

echo "✅ Production deployment completed!"
echo "📊 Final data count:"
psql $DATABASE_URL -c "SELECT 'Users:' as info, COUNT(*) as count FROM \"User\";"
psql $DATABASE_URL -c "SELECT 'PKS:' as info, COUNT(*) as count FROM \"Pks\";"
psql $DATABASE_URL -c "SELECT 'Admins:' as info, COUNT(*) as count FROM \"User\" WHERE \"role\" = 'ADMIN';"
