ALTER TABLE shop_looks ADD COLUMN IF NOT EXISTS slug text;
UPDATE shop_looks SET slug = concat(lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')), '-', substr(md5(random()::text), 1, 4)) WHERE slug IS NULL OR slug = '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_looks_slug ON shop_looks(slug);
NOTIFY pgrst, 'reload config';