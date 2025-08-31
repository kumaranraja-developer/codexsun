// cortex/migration/Builder.ts
// Pure SQL generator: no config, no connection — Runner supplies the driver.

import {ColumnSpec, ConstraintSpec, TableDefFn, Blueprint, TableBlueprint} from "./Blueprint";
import { SqliteBlueprint } from "./blueprint/sqlite";
import { MariadbBlueprint } from "./blueprint/mariadb";
import { PostgresBlueprint } from "./blueprint/postgres";

// Keep the driver type local so Builder doesn’t depend on DB config/types.
export type DBDriver = "sqlite" | "mariadb" | "postgres";

// Migration table def type
export type TableDef = (t: Blueprint) => void;

export interface BuildResult {
    name: string;
    content: string;
}

function pickBlueprint(driver: DBDriver): Blueprint {
    switch (driver) {
        case "sqlite":   return new SqliteBlueprint();
        case "mariadb":  return new MariadbBlueprint();
        case "postgres": return new PostgresBlueprint();
        default:
            throw new Error(`Unsupported driver for Builder: ${String(driver)}`);
    }
}

export interface BuiltTable {
    name: string;
    columns: ColumnSpec[];
    constraints: ConstraintSpec[];
}

export class Builder {
    constructor(private readonly driver: DBDriver) {}

    buildCreateTable(tableName: string, def: TableDef): BuildResult {
        const bp = pickBlueprint(this.driver);
        bp.reset(tableName);
        def(bp);
        return { name: tableName, content: bp.buildCreate() };
    }

    buildDropTable(tableName: string): BuildResult {
        const bp = pickBlueprint(this.driver);
        bp.reset(tableName);
        return { name: tableName, content: bp.buildDrop() };
    }

    // Optional: back-compat names if your Runner still calls these
    createTable(tableName: string, def: TableDef): BuildResult {
        return this.buildCreateTable(tableName, def);
    }
    dropTable(tableName: string): BuildResult {
        return this.buildDropTable(tableName);
    }
}

export interface BuiltTable {
    name: string;
    columns: ColumnSpec[];
    constraints: ConstraintSpec[];
}

/** Helper for migration files: export default defineTable("tenants", (t) => { ... }) */
export function defineTable(name: string, def: TableDefFn): BuiltTable {
    const bp = new TableBlueprint(name).build(def); // ← use concrete class
    return { name: bp.tableName, columns: bp.table.columns, constraints: bp.table.constraints };
}

export default Builder;
