-- Script untuk backup data penting sebelum migration
-- Jalankan ini sebelum prisma migrate reset

-- Backup User data
CREATE TABLE IF NOT EXISTS "User_backup" AS 
SELECT * FROM "User";

-- Backup PKS data
CREATE TABLE IF NOT EXISTS "Pks_backup" AS 
SELECT * FROM "Pks";

-- Tampilkan data yang di-backup
SELECT 'User backup created with' as info, COUNT(*) as count FROM "User_backup";
SELECT 'PKS backup created with' as info, COUNT(*) as count FROM "Pks_backup";
