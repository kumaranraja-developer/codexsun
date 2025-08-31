// cortex/migration/Builder.ts
// Pure SQL generator: no config, no connection — Runner supplies the driver.

import {ColumnSpec, ConstraintSpec, TableDefFn, Blueprint, TableBlueprint} from "./Blueprint";
import {SqliteBlueprint} from "./blueprint/sqlite";
import {MariadbBlueprint} from "./blueprint/mariadb";
import {PostgresBlueprint} from "./blueprint/postgres";

// Keep the driver type local so Builder doesn’t depend on DB config/types.
export type DBDriver = "sqlite" | "mariadb" | "postgres";

// Migration table def type
export type TableDef = (t: Blueprint) => void;

export interface BuildResult {
    name: string;
    content: string;
}

function pickBlueprint(driver: DBDriver, tableName: string) {
    switch (driver) {
        case "sqlite":
            return new SqliteBlueprint(tableName);
        case "mariadb":
            return new MariadbBlueprint(tableName);
        case "postgres":
            return new PostgresBlueprint(tableName);
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
    constructor(private readonly driver: DBDriver) {
    }

    public buildCreateTable(
        name: string,
        def: TableDefFn
    ): { name: string; content: string } {
        const bp = pickBlueprint(this.driver, name);
        const sql = bp.buildCreate(def); // dialect renders CREATE TABLE …
        return {name, content: sql};
    }

    public buildDropTable(name: string): { name: string; content: string } {
        const bp = pickBlueprint(this.driver, name);
        const sql = bp.buildDrop(); // dialect renders DROP TABLE …
        return {name, content: sql};
    }

    // Optional: support schema-object style exports
    public buildCreateFromSchemaObject(schema: {
        name: string;
        columns: ColumnSpec[];
        constraints?: ConstraintSpec[];
    }): { name: string; content: string } {
        if (!schema?.name) throw new Error("Schema object must include 'name'.");
        const bp = pickBlueprint(this.driver, schema.name);
        // hydrate the blueprint’s payload directly
        bp.table.columns = schema.columns ?? [];
        bp.table.constraints = schema.constraints ?? [];
        const sql = bp.buildCreate(); // dialect renders using populated payload
        return {name: schema.name, content: sql};
    }
}

/** Helper for migration files: export default defineTable("tenants", (t) => { ... }) */
export function defineTable(name: string, def: TableDefFn): BuiltTable {
    // Use the base (driver-agnostic) TableBlueprint to collect schema
    const bp = new TableBlueprint(name).build(def);
    return {
        name: bp.tableName,
        columns: bp.table.columns,
        constraints: bp.table.constraints,
    };
}

export default Builder;
