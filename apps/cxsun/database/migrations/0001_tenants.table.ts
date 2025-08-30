// apps/cxsun/database/migrations/0001_tenants.table.ts
import { defineTable } from "../../../../cortex/migration/Builder";

export default defineTable("tenants", (table) => {
    table.line("CREATE TABLE tenants (");
    table.lines(
        "  id TEXT PRIMARY KEY,",
        "  slug TEXT UNIQUE NOT NULL,",
        "  name TEXT NOT NULL,",
        "  description TEXT,",
        "  domain TEXT UNIQUE,",
        "  logo DECIMAL(2),",
        "  logo_bg INTEGER,",
        "  created_at TIMESTAMP,",
        "  updated_at TIMESTAMP"
    );
    table.line(");");
});
