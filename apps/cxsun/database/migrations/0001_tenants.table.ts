// apps/cxsun/database/migrations/0001_tenants.table.ts
import { defineTable } from "../../../../cortex/migration/Builder";

export default defineTable("tenants", (table) => {
    table.id();
    table.text("name").unique();
    table.text("display_name").notnull().default("Unnamed Tenant");
    table.timestamps();
});
