-- apps/cxsun/database/migrations/0001_create_tenants.sql
-- table: tenants

CREATE TABLE IF NOT EXISTS tenants (
                                       id TEXT PRIMARY KEY,                  -- UUID or cuid
                                       name TEXT NOT NULL,                   -- tenant display name
                                       slug TEXT UNIQUE NOT NULL,            -- unique slug for URLs
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- optional: seed a default tenant
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default')
    ON CONFLICT(slug) DO NOTHING;
