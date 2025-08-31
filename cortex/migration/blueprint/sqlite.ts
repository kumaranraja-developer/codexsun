// cortex/migration/sqlite.ts
//
// SQLite renderer implementing the abstract Blueprint contract.
// - Uses double-quoted identifiers
// - SQLite is type-affinity based; we map reasonably
// - Emits named UNIQUE as table constraints
// - Non-unique indexes emitted as separate CREATE INDEX statements
//
// Exports:
//   - renderCreateTable (function)
//   - class SqliteBlueprint (default)

import { Blueprint, ColumnSpec, TableDefFn } from "../Blueprint";
import { BuiltTable } from "../Builder";

const q = (id: string) => `"${id}"`;

function defaultSql(c: ColumnSpec) {
    if (c.default === undefined) return "";
    if (typeof c.default === "string") return ` DEFAULT '${c.default}'`;
    if (typeof c.default === "number") return ` DEFAULT ${c.default}`;
    if (typeof c.default === "boolean") return ` DEFAULT ${c.default ? 1 : 0}`;
    if (c.default === null) return ` DEFAULT NULL`;
    return "";
}

function notnullSql(c: ColumnSpec) {
    return c.notnull ? " NOT NULL" : c.nullable ? " NULL" : "";
}

function uniqueInlineSql(c: ColumnSpec) {
    if (!c.unique) return "";
    if (typeof c.unique === "string") return "";
    return " UNIQUE";
}

function columnLine(c: ColumnSpec): string[] {
    const name = c.name ? q(c.name) : undefined;
    const nn = notnullSql(c);
    const dflt = defaultSql(c);
    const uniq = uniqueInlineSql(c);

    switch (c.kind) {
        // Boolean
        case "boolean": return [`${name} INTEGER${nn}${dflt}${uniq}`];

        // Strings
        case "char":
        case "string": return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "text":
        case "tinyText":
        case "mediumText":
        case "longText": return [`${name} TEXT${nn}${uniq}`];

        // Numeric / IDs
        case "id": return [`${name} TEXT PRIMARY KEY`]; // store UUID as TEXT
        case "increments": return [`${name} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT`];
        case "bigIncrements": return [`${name} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT`];
        case "mediumIncrements":
        case "smallIncrements":
        case "tinyIncrements": return [`${name} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT`];

        case "integer":
        case "bigInteger":
        case "mediumInteger":
        case "smallInteger":
        case "tinyInteger":
        case "unsignedBigInteger":
        case "unsignedInteger":
        case "unsignedMediumInteger":
        case "unsignedSmallInteger":
        case "unsignedTinyInteger": return [`${name} INTEGER${nn}${dflt}${uniq}`];

        case "decimal":
        case "double":
        case "float": return [`${name} REAL${nn}${dflt}${uniq}`];

        // Date & Time (store as TEXT by convention or INTEGER unix time; we use TEXT)
        case "dateTime":
        case "dateTimeTz":
        case "timestamp": return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "date": return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "time":
        case "timeTz": return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "timestamps":
        case "timestampsTz":
            return [
                `${q("createdAt")} TEXT NOT NULL`,
                `${q("updatedAt")} TEXT NOT NULL`,
            ];
        case "softDeletes":
        case "softDeletesTz":
            return [`${q(c.name ?? "deletedAt")} TEXT NULL`];
        case "year": return [`${name} INTEGER${nn}${dflt}${uniq}`];

        // Binary
        case "binary":
        case "blob":
        case "vector": return [`${name} BLOB${nn}${uniq}`];

        // JSON
        case "json":
        case "jsonb": return [`${name} TEXT${nn}${uniq}`];

        // UUID / ULID
        case "uuid": return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "ulid": return [`${name} TEXT${nn}${dflt}${uniq}`];

        // Morph helpers
        case "uuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NOT NULL`,
                `${q(base + "_id")} TEXT NOT NULL`,
            ];
        }
        case "ulidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NOT NULL`,
                `${q(base + "_id")} TEXT NOT NULL`,
            ];
        }
        case "nullableUuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NULL`,
                `${q(base + "_id")} TEXT NULL`,
            ];
        }
        case "nullableUlidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NULL`,
                `${q(base + "_id")} TEXT NULL`,
            ];
        }

        // Spatial (no native; store as BLOB/TEXT — we choose BLOB)
        case "geography":
        case "geometry": return [`${name} BLOB${nn}${uniq}`];

        // Relationships
        case "foreignId":
        case "foreignIdFor":
        case "foreignUlid":
        case "foreignUuid": return [`${name} TEXT${nn}${uniq}`];
        case "morphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NOT NULL`,
                `${q(base + "_id")} TEXT NOT NULL`,
            ];
        }
        case "nullableMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} TEXT NULL`,
                `${q(base + "_id")} TEXT NULL`,
            ];
        }

        // Specialty
        case "enum":
        case "set":
        case "macAddress":
        case "ipAddress":
        case "rememberToken":
            return [`${name ?? q("rememberToken")} TEXT${nn}${dflt}${uniq}`];

        // Conveniences
        case "slug": return [`${name} TEXT NOT NULL UNIQUE`];
        case "version": return [`${name} INTEGER NOT NULL DEFAULT 1`];
        case "active": {
            // SQLite has no regex by default; enforce length only.
            const check = ` CHECK (length(${name}) <= 10)`;
            return [`${name} TEXT NOT NULL DEFAULT '1'${check}`];
        }

        default:
            throw new Error(`SQLite renderer: unsupported column kind "${c.kind}" on ${c.name}`);
    }
}

function uniqueConstraintLine(table: string, cols: string[], name?: string) {
    const idxName = name || `uq_${table}_${cols.join("_")}`;
    const colsSql = cols.map(q).join(", ");
    return `CONSTRAINT "${idxName}" UNIQUE (${colsSql})`;
}

function createIndexStmt(table: string, cols: string[], name?: string) {
    const idxName = name || `idx_${table}_${cols.join("_")}`;
    const colsSql = cols.map(q).join(", ");
    return `CREATE INDEX IF NOT EXISTS "${idxName}" ON ${q(table)} (${colsSql});`;
}

export function renderCreateTable(t: BuiltTable): string {
    const columnLines: string[] = [];
    const tableConstraints: string[] = [];
    const postStmts: string[] = [];

    for (const c of t.columns) columnLines.push(...columnLine(c));

    // named per-column uniques -> table-level constraints
    for (const c of t.columns) {
        if (c.name && typeof c.unique === "string") {
            tableConstraints.push(uniqueConstraintLine(t.name, [c.name], c.unique));
        }
    }

    for (const con of t.constraints) {
        if (con.type === "unique" || con.unique) {
            tableConstraints.push(uniqueConstraintLine(t.name, con.cols, con.name));
        } else {
            postStmts.push(createIndexStmt(t.name, con.cols, con.name));
        }
    }

    const allDefs = [...columnLines, ...tableConstraints].map(l => `  ${l}`).join(",\n");
    const create = `CREATE TABLE IF NOT EXISTS ${q(t.name)} (\n${allDefs}\n);`;

    return [create, ...postStmts].join("\n");
}

export class SqliteBlueprint extends Blueprint {
    constructor(name: string = "default") { super(name); }
    override buildCreate(def?: TableDefFn): string {
        const built = (def ? this.buildPayload(def) : this.buildPayload()) as unknown as BuiltTable;
        return renderCreateTable(built);
    }
    override buildDrop(): string {
        return `DROP TABLE IF EXISTS ${q(this.tableName)};`;
    }
}

export default SqliteBlueprint;
