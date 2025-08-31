// cortex/migration/postgres.ts
//
// PostgreSQL renderer implementing the abstract Blueprint contract.
// - Uses double-quoted identifiers
// - Emits table-level UNIQUE constraints, and separate CREATE INDEX statements
// - Timestamps use NOW(); note: Postgres doesn't auto-update updatedAt without triggers
//
// Exports:
//   - renderCreateTable (function)
//   - class PostgresBlueprint (default)

import { Blueprint, ColumnSpec, TableDefFn } from "../Blueprint";
import { BuiltTable } from "../Builder";

const q = (id: string) => `"${id}"`;

const isTextual = (k: ColumnSpec["kind"]) =>
    k === "text" || k === "tinyText" || k === "mediumText" || k === "longText" ||
    k === "json" || k === "jsonb";

function defaultSql(c: ColumnSpec) {
    if (c.default === undefined) return "";
    if (isTextual(c.kind)) return ""; // Postgres: TEXT/JSON no default literals by convention in our DSL
    if (typeof c.default === "string") return ` DEFAULT '${c.default}'`;
    if (typeof c.default === "number") return ` DEFAULT ${c.default}`;
    if (typeof c.default === "boolean") return ` DEFAULT ${c.default ? "TRUE" : "FALSE"}`;
    if (c.default === null) return ` DEFAULT NULL`;
    return "";
}

function notnullSql(c: ColumnSpec) {
    return c.notnull ? " NOT NULL" : c.nullable ? " NULL" : "";
}

// Only unnamed inline unique allowed; named uniques => table constraints.
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
        case "boolean": return [`${name} BOOLEAN${nn}${dflt}${uniq}`];

        // Strings
        case "char": return [`${name} CHAR(${c.params?.length ?? 255})${nn}${dflt}${uniq}`];
        case "string": return [`${name} VARCHAR(${c.params?.length ?? 255})${nn}${dflt}${uniq}`];
        case "text":
        case "tinyText":
        case "mediumText":
        case "longText": return [`${name} TEXT${nn}${uniq}`];

        // Numeric / IDs
        case "id": return [`${name} UUID PRIMARY KEY`];
        case "increments": return [`${name} SERIAL PRIMARY KEY`];
        case "bigIncrements": return [`${name} BIGSERIAL PRIMARY KEY`];
        case "mediumIncrements": return [`${name} SERIAL PRIMARY KEY`];
        case "smallIncrements":
        case "tinyIncrements": return [`${name} SMALLSERIAL PRIMARY KEY`];

        case "integer": return [`${name} INTEGER${nn}${dflt}${uniq}`];
        case "bigInteger": return [`${name} BIGINT${nn}${dflt}${uniq}`];
        case "mediumInteger": return [`${name} INTEGER${nn}${dflt}${uniq}`];
        case "smallInteger":
        case "tinyInteger": return [`${name} SMALLINT${nn}${dflt}${uniq}`];

        // Unsigned types don't exist in PG; we map to normal types.
        case "unsignedBigInteger": return [`${name} BIGINT${nn}${dflt}${uniq}`];
        case "unsignedInteger": return [`${name} INTEGER${nn}${dflt}${uniq}`];
        case "unsignedMediumInteger": return [`${name} INTEGER${nn}${dflt}${uniq}`];
        case "unsignedSmallInteger":
        case "unsignedTinyInteger": return [`${name} SMALLINT${nn}${dflt}${uniq}`];

        case "decimal": return [`${name} NUMERIC(${c.params?.precision ?? 8},${c.params?.scale ?? 2})${nn}${dflt}${uniq}`];
        case "double": return [`${name} DOUBLE PRECISION${nn}${dflt}${uniq}`];
        case "float": return [`${name} REAL${nn}${dflt}${uniq}`];

        // Date & Time
        case "dateTime": return [`${name} TIMESTAMP WITHOUT TIME ZONE${nn}${dflt}${uniq}`];
        case "dateTimeTz": return [`${name} TIMESTAMPTZ${nn}${dflt}${uniq}`];
        case "date": return [`${name} DATE${nn}${dflt}${uniq}`];
        case "time": return [`${name} TIME WITHOUT TIME ZONE${nn}${dflt}${uniq}`];
        case "timeTz": return [`${name} TIME WITH TIME ZONE${nn}${dflt}${uniq}`];
        case "timestamp": return [`${name} TIMESTAMPTZ${nn}${dflt}${uniq}`];
        case "timestamps":
        case "timestampsTz":
            return [
                `${q("createdAt")} TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
                `${q("updatedAt")} TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
            ];
        case "softDeletes":
        case "softDeletesTz":
            return [`${q(c.name ?? "deletedAt")} TIMESTAMPTZ NULL DEFAULT NULL`];
        case "year": return [`${name} INTEGER${nn}${dflt}${uniq}`];

        // Binary
        case "binary":
        case "blob": return [`${name} BYTEA${nn}${uniq}`];

        // JSON
        case "json": return [`${name} JSON${nn}${uniq}`];
        case "jsonb": return [`${name} JSONB${nn}${uniq}`];

        // UUID / ULID
        case "uuid": return [`${name} UUID${nn}${dflt}${uniq}`];
        case "ulid": return [`${name} CHAR(26)${nn}${dflt}${uniq}`];

        // Morph helpers
        case "uuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} UUID NOT NULL`,
            ];
        }
        case "ulidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} CHAR(26) NOT NULL`,
            ];
        }
        case "nullableUuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} UUID NULL`,
            ];
        }
        case "nullableUlidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} CHAR(26) NULL`,
            ];
        }

        // Spatial (requires PostGIS)
        case "geography": return [`${name} GEOGRAPHY${nn}${uniq}`];
        case "geometry": return [`${name} GEOMETRY${nn}${uniq}`];

        // Relationships (type mapping only; FK emitted separately)
        case "foreignId":
        case "foreignUuid": return [`${name} UUID${nn}${uniq}`];
        case "foreignUlid": return [`${name} CHAR(26)${nn}${uniq}`];
        case "foreignIdFor": return [`${name} UUID${nn}${uniq}`];
        case "morphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} VARCHAR(255) NOT NULL`,
            ];
        }
        case "nullableMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} VARCHAR(255) NULL`,
            ];
        }

        // Specialty
        case "enum": {
            const values: string[] = c.params?.values || [];
            const check = values.length ? ` CHECK (${name} IN (${values.map(v => `'${v}'`).join(", ")}))` : "";
            return [`${name} TEXT${nn}${dflt}${uniq}${check}`];
        }
        case "set":
            // No native SET; store as TEXT (CSV) or TEXT[] if you prefer. We use TEXT.
            return [`${name} TEXT${nn}${dflt}${uniq}`];
        case "macAddress": return [`${name} MACADDR${nn}${dflt}${uniq}`];
        case "ipAddress": return [`${name} INET${nn}${dflt}${uniq}`];
        case "rememberToken": return [`${q(c.name ?? "rememberToken")} VARCHAR(100) NULL`];
        case "vector": return [`${name} BYTEA${nn}${uniq}`];

        // Conveniences
        case "slug": return [`${name} VARCHAR(255) NOT NULL UNIQUE`];
        case "version": return [`${name} INTEGER NOT NULL DEFAULT 1`];
        case "active": {
            const check = ` CHECK (${name} ~ '^[0-9]{1,10}$')`;
            return [`${name} CHAR(10) NOT NULL DEFAULT '1'${check}`];
        }

        default:
            throw new Error(`Postgres renderer: unsupported column kind "${c.kind}" on ${c.name}`);
    }
}

function fkClause(table: string, c: ColumnSpec): string | null {
    if (!c.name || !c.references) return null;
    const onDelete = c.references?.onDelete ? ` ON DELETE ${c.references.onDelete}` : "";
    const onUpdate = c.references?.onUpdate ? ` ON UPDATE ${c.references.onUpdate}` : "";
    const col = q(c.name);
    const refTable = q(c.references.table);
    const refCol = q(c.references.column ?? "id");
    return `ALTER TABLE ${q(table)} ADD CONSTRAINT ${q(`fk_${table}_${c.name}`)} FOREIGN KEY (${col}) REFERENCES ${refTable} (${refCol})${onDelete}${onUpdate};`;
}

function uniqueConstraintLine(table: string, cols: string[], name?: string) {
    const idxName = name || `uq_${table}_${cols.join("_")}`;
    const colsSql = cols.map(q).join(", ");
    return `CONSTRAINT ${q(idxName)} UNIQUE (${colsSql})`;
}

function createIndexStmt(table: string, cols: string[], name?: string) {
    const idxName = name || `idx_${table}_${cols.join("_")}`;
    const colsSql = cols.map(q).join(", ");
    return `CREATE INDEX ${q(idxName)} ON ${q(table)} (${colsSql});`;
}

export function renderCreateTable(t: BuiltTable): string {
    const columnLines: string[] = [];
    const tableConstraints: string[] = [];
    const postStmts: string[] = [];

    // columns (some emit multiple lines)
    for (const c of t.columns) columnLines.push(...columnLine(c));

    // per-column named uniques -> table-level unique constraints
    for (const c of t.columns) {
        if (c.name && typeof c.unique === "string") {
            tableConstraints.push(uniqueConstraintLine(t.name, [c.name], c.unique));
        }
    }

    // table-level constraints from Blueprint
    for (const con of t.constraints) {
        if (con.type === "unique" || con.unique) {
            tableConstraints.push(uniqueConstraintLine(t.name, con.cols, con.name));
        } else {
            // non-unique indexes => post CREATE INDEX statements
            postStmts.push(createIndexStmt(t.name, con.cols, con.name));
        }
    }

    const allDefs = [...columnLines, ...tableConstraints].map(l => `  ${l}`).join(",\n");
    const create = `CREATE TABLE IF NOT EXISTS ${q(t.name)} (\n${allDefs}\n);`;

    // FKs must be separate ALTER TABLE statements (keeps things explicit)
    const fks: string[] = [];
    for (const c of t.columns) {
        const fk = fkClause(t.name, c);
        if (fk) fks.push(fk);
    }

    return [create, ...fks, ...postStmts].join("\n");
}

export class PostgresBlueprint extends Blueprint {
    constructor(name: string = "default") { super(name); }
    override buildCreate(def?: TableDefFn): string {
        const built = (def ? this.buildPayload(def) : this.buildPayload()) as unknown as BuiltTable;
        return renderCreateTable(built);
    }
    override buildDrop(): string {
        return `DROP TABLE IF EXISTS ${q(this.tableName)} CASCADE;`;
    }
}

export default PostgresBlueprint;
