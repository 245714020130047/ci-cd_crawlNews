-- Fix admin password hash (admin123)
UPDATE users
SET password_hash = '$2a$10$l/Vdk3SU3QbUUIYdcfjZoO2sxxApemUrf.x4plnIcDu6mkS.9Qt9G'
WHERE email = 'admin@newscrawler.local';
