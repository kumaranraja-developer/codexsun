// apps/cxsun/database/migrations/0002_users.table.ts

import { defineTable } from "../../../../cortex/migration/Builder";

export default defineTable("users", (table) => {
    table.id();
    table.text("name").notnull();
    table.text("email").unique();
    table.timestamps();
});
