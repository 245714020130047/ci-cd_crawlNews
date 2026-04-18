-- Fix admin password hash (admin123)
UPDATE users
SET password_hash = '$2a$10$KIsnZrt64D6j0SZx..AGnediY5SzzyTt3pdd.3cElYqgt5vZeNV/S'
WHERE email = 'admin@newscrawler.local';
