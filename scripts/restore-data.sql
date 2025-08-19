-- Script untuk restore data penting setelah migration
-- Jalankan ini setelah prisma migrate deploy

-- Restore User data (hanya jika tabel backup ada)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User_backup') THEN
        -- Restore User data
        INSERT INTO "User" (
            "id", "name", "email", "password", "role", "isVerified", 
            "verificationToken", "resetPasswordToken", "resetPasswordTokenExpiry", 
            "createdAt", "updatedAt", "lastVisited"
        )
        SELECT 
            "id", "name", "email", "password", "role", "isVerified", 
            "verificationToken", "resetPasswordToken", "resetPasswordTokenExpiry", 
            "createdAt", "updatedAt", "lastVisited"
        FROM "User_backup"
        ON CONFLICT ("id") DO NOTHING;
        
        -- Reset sequence untuk id
        SELECT setval('"User_id_seq"', (SELECT MAX("id") FROM "User"));
        
        RAISE NOTICE 'User data restored successfully';
    ELSE
        RAISE NOTICE 'User_backup table not found, skipping restore';
    END IF;
END $$;

-- Restore PKS data (hanya jika tabel backup ada)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Pks_backup') THEN
        -- Restore PKS data
        INSERT INTO "Pks" (
            "id", "originalName", "filename", "path", "company", "status", 
            "submittedAt", "approvedAt", "rejectedAt", "reason", "userId"
        )
        SELECT 
            "id", "originalName", "filename", "path", "company", "status", 
            "submittedAt", "approvedAt", "rejectedAt", "reason", "userId"
        FROM "Pks_backup"
        ON CONFLICT ("id") DO NOTHING;
        
        -- Reset sequence untuk id
        SELECT setval('"Pks_id_seq"', (SELECT MAX("id") FROM "Pks"));
        
        RAISE NOTICE 'PKS data restored successfully';
    ELSE
        RAISE NOTICE 'Pks_backup table not found, skipping restore';
    END IF;
END $$;

-- Hapus tabel backup setelah restore
DROP TABLE IF EXISTS "User_backup";
DROP TABLE IF EXISTS "Pks_backup";

-- Tampilkan data yang berhasil di-restore
SELECT 'Users restored:' as info, COUNT(*) as count FROM "User";
SELECT 'PKS restored:' as info, COUNT(*) as count FROM "Pks";
