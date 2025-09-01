// apps/cxsun/database/migrations/0001_tenants.table.ts
import {defineTable} from "../../../../cortex/migration/Builder";

export default defineTable("tenant", (table) => {
    table.id();
    table.string("slug").notnull().unique();
    table.string("name").notnull();
    table.string("email").nullable().unique();
    table.json("meta").nullable();
    table.active("is_active");
    table.timestamps();
    table.timestamp("deleted_at").nullable();
});
