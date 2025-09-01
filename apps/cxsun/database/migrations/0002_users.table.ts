// apps/cxsun/database/migrations/0002_users.table.ts

import { defineTable } from "../../../../cortex/migration/Builder";

export default defineTable("users", (table) => {
    table.id();
    table.text("name").notnull();
    table.text("email").unique();
    table.text("password").notnull();
    table.foreignId("tenant_id").notnull().references("tenant").index();
    table.json("meta").nullable();
    table.active();
    table.timestamps();
    table.timestamp("deleted_at").nullable();

});
