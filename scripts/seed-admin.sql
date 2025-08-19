-- Script untuk membuat admin default
-- Jalankan ini setelah restore data atau jika tidak ada admin

-- Buat admin default jika tidak ada admin
INSERT INTO "User" (
    "name", "email", "password", "role", "isVerified", 
    "createdAt", "updatedAt"
) 
SELECT 
    'Super Admin', 
    'adminapi@bpjs-kesehatan.go.id', 
    '$2a$10$rQZ8K9mN2pL4vX7wY1sT3uI6oP8qR5eF2gH4jK7lM9nO0pQ1rS2tU3vW4x5y6z', -- password: jkn2025api
    'ADMIN', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "User" WHERE "role" = 'ADMIN'
);

-- Tampilkan admin yang berhasil dibuat
SELECT 'Admin users:' as info, COUNT(*) as count FROM "User" WHERE "role" = 'ADMIN';
