// apps/cxsun/database/migrations/0001_tenants.table.ts
import { defineTable } from "../../../../cortex/migration/Builder";

export default defineTable("tenants", (table) => {
    table.id();
    table.text("name").unique();
    table.text("active_id").notnull().default("1");
    table.timestamps();
});
