// cortex/migration/Builder.ts
import type { DBConfig } from "../database/types";
import { MariadbBlueprint } from "./blueprint/mariadb";
import { PostgresBlueprint } from "./blueprint/postgres";
import { SqliteBlueprint } from "./blueprint/sqlite";
import type { TableBlueprint } from "./Blueprint";

// what migration files receive
export type TableDef = (table: TableBlueprint) => void;

export function getBlueprint(driver: DBConfig["driver"]) {
    switch (driver) {
        case "sqlite":   return new SqliteBlueprint();
        case "mariadb":  return new MariadbBlueprint();
        case "postgres": return new PostgresBlueprint();
        default:
            throw new Error(`Unsupported driver: ${driver as string}`);
    }
}

// Small shape your tests can log easily
export interface BuildResult {
    name: string;     // table name
    content: string;  // emitted SQL
}

export class Builder {
    private blueprint: TableBlueprint;

    constructor(private cfg: DBConfig) {
        this.blueprint = getBlueprint(cfg.driver);
    }

    createTable(name: string, def: TableDef, ctx?: unknown): BuildResult {
        this.blueprint.reset(name);
        this.wireContext(ctx);
        def(this.blueprint);
        const sql = this.blueprint.buildCreate();
        return { name, content: sql };
    }

    dropTable(name: string, _ctx?: unknown): BuildResult {
        this.blueprint.reset(name);
        const sql = this.blueprint.buildDrop();
        return { name, content: sql };
    }

    private wireContext(ctx?: unknown) {
        const b = this.blueprint as any;
        if (typeof b.setContext === "function") {
            b.setContext(ctx);
            return;
        }
        b.ctx = ctx; // fallback, non-breaking
    }
}

// Helper for migration files: defineTable("tenants", t => { ... })
export function defineTable(tableName: string, def: TableDef) {
    return { tableName, def };
}
