// cortex/migration/mariadb.ts
//
// MariaDB renderer that implements the abstract Blueprint contract.
// Returns SQL strings (matching Builder’s expectations).
//
// Exports:
//   - renderCreateTable (pure function)
//   - class MariadbBlueprint (default)

import { Blueprint, ColumnSpec, TableDefFn } from "../Blueprint";
import { BuiltTable } from "../Builder";

const q = (id: string) => `\`${id}\``;

const isTextual = (k: ColumnSpec["kind"]) =>
    k === "text" || k === "tinyText" || k === "mediumText" || k === "longText" ||
    k === "json" || k === "jsonb" || k === "binary" || k === "blob" || k === "vector";

function defaultSql(c: ColumnSpec) {
    if (c.default === undefined) return "";
    if (isTextual(c.kind)) return "";
    if (typeof c.default === "string") return ` DEFAULT '${c.default}'`;
    if (typeof c.default === "number") return ` DEFAULT ${c.default}`;
    if (typeof c.default === "boolean") return ` DEFAULT ${c.default ? 1 : 0}`;
    if (c.default === null) return ` DEFAULT NULL`;
    return "";
}
function notnullSql(c: ColumnSpec) { return c.notnull ? " NOT NULL" : c.nullable ? " NULL" : ""; }
function uniqueInlineSql(c: ColumnSpec) {
    if (!c.unique) return "";
    if (typeof c.unique === "string") return ""; // named uniques as table constraints
    return " UNIQUE";
}

function columnLine(c: ColumnSpec): string[] {
    const name = c.name ? q(c.name) : undefined;
    const nn = notnullSql(c);
    const dflt = defaultSql(c);
    const uniq = uniqueInlineSql(c);

    switch (c.kind) {
        case "boolean": return [`${name} TINYINT(1)${nn}${dflt}${uniq}`];

        case "char": return [`${name} CHAR(${c.params?.length ?? 255})${nn}${dflt}${uniq}`];
        case "string": return [`${name} VARCHAR(${c.params?.length ?? 255})${nn}${dflt}${uniq}`];
        case "text": return [`${name} TEXT${nn}`];
        case "tinyText": return [`${name} TINYTEXT${nn}`];
        case "mediumText": return [`${name} MEDIUMTEXT${nn}`];
        case "longText": return [`${name} LONGTEXT${nn}`];

        case "id": return [`${name} INT PRIMARY KEY AUTO_INCREMENT`];
        case "increments": return [`${name} INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`];
        case "bigIncrements": return [`${name} BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`];
        case "mediumIncrements": return [`${name} MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`];
        case "smallIncrements": return [`${name} SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`];
        case "tinyIncrements": return [`${name} TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY`];

        case "integer": return [`${name} INT${nn}${dflt}${uniq}`];
        case "bigInteger": return [`${name} BIGINT${nn}${dflt}${uniq}`];
        case "mediumInteger": return [`${name} MEDIUMINT${nn}${dflt}${uniq}`];
        case "smallInteger": return [`${name} SMALLINT${nn}${dflt}${uniq}`];
        case "tinyInteger": return [`${name} TINYINT${nn}${dflt}${uniq}`];

        case "unsignedBigInteger": return [`${name} BIGINT UNSIGNED${nn}${dflt}${uniq}`];
        case "unsignedInteger": return [`${name} INT UNSIGNED${nn}${dflt}${uniq}`];
        case "unsignedMediumInteger": return [`${name} MEDIUMINT UNSIGNED${nn}${dflt}${uniq}`];
        case "unsignedSmallInteger": return [`${name} SMALLINT UNSIGNED${nn}${dflt}${uniq}`];
        case "unsignedTinyInteger": return [`${name} TINYINT UNSIGNED${nn}${dflt}${uniq}`];

        case "decimal": return [`${name} DECIMAL(${c.params?.precision ?? 8},${c.params?.scale ?? 2})${nn}${dflt}${uniq}`];
        case "double": return [`${name} DOUBLE(${c.params?.precision ?? 8},${c.params?.scale ?? 2})${nn}${dflt}${uniq}`];
        case "float": return [`${name} FLOAT(${c.params?.precision ?? 8},${c.params?.scale ?? 2})${nn}${dflt}${uniq}`];

        case "dateTime":
        case "dateTimeTz": return [`${name} DATETIME${nn}${dflt}${uniq}`];
        case "date": return [`${name} DATE${nn}${dflt}${uniq}`];
        case "time":
        case "timeTz": return [`${name} TIME${nn}${dflt}${uniq}`];
        case "timestamp": return [`${name} TIMESTAMP${nn}${dflt}${uniq}`];
        case "timestamps":
        case "timestampsTz":
            return [
                `\`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`,
                `\`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
            ];
        case "softDeletes":
        case "softDeletesTz":
            return [`${q(c.name ?? "deleted_at")} TIMESTAMP NULL DEFAULT NULL`];
        case "year": return [`${name} YEAR${nn}${dflt}${uniq}`];

        case "binary": return [`${name} VARBINARY(255)${nn}`];
        case "blob": return [`${name} BLOB${nn}`];

        case "json":
        case "jsonb": return [`${name} JSON${nn}`];

        case "uuid": return [`${name} CHAR(36)${nn}${dflt}${uniq}`];
        case "ulid": return [`${name} CHAR(26)${nn}${dflt}${uniq}`];

        case "uuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} CHAR(36) NOT NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }
        case "ulidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} CHAR(26) NOT NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }
        case "nullableUuidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} CHAR(36) NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }
        case "nullableUlidMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} CHAR(26) NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }

        case "geography":
        case "geometry":
            return [`${name} GEOMETRY${nn}`];

        case "foreignId": return [`${name} INTEGER${nn}${uniq}`];
        case "foreignIdFor": return [`${name} CHAR(36)${nn}${uniq}`];
        case "foreignUlid": return [`${name} CHAR(26)${nn}${uniq}`];
        case "foreignUuid": return [`${name} CHAR(36)${nn}${uniq}`];
        case "morphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NOT NULL`,
                `${q(base + "_id")} VARCHAR(255) NOT NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }
        case "nullableMorphs": {
            const base = c.name!;
            return [
                `${q(base + "_type")} VARCHAR(255) NULL`,
                `${q(base + "_id")} VARCHAR(255) NULL`,
                `INDEX ${q(`idx_${base}_morph`)} (${q(base + "_type")}, ${q(base + "_id")})`,
            ];
        }

        case "enum": {
            const values: string[] = c.params?.values || [];
            const defs = values.map(v => `'${v}'`).join(", ");
            return [`${name} ENUM(${defs})${nn}${dflt}${uniq}`];
        }
        case "set": {
            const values: string[] = c.params?.values || [];
            const defs = values.map(v => `'${v}'`).join(", ");
            return [`${name} SET(${defs})${nn}${dflt}${uniq}`];
        }
        case "macAddress": return [`${name} VARCHAR(17)${nn}${dflt}${uniq}`];
        case "ipAddress": return [`${name} VARCHAR(45)${nn}${dflt}${uniq}`];
        case "rememberToken": return [`${q(c.name ?? "rememberToken")} VARCHAR(100) NULL`];
        case "vector": return [`${name} BLOB${nn}`];

        case "slug": return [`${name} VARCHAR(255) NOT NULL UNIQUE`];
        case "version": return [`${name} INT NOT NULL DEFAULT 1`];
        case "active": {
            const check = ` CHECK (${name} REGEXP '^[0-9]{1,10}$')`;
            return [`${name} CHAR(10) NOT NULL DEFAULT '1'${check}`];
        }

        default:
            throw new Error(`MariaDB renderer: unsupported column kind "${c.kind}" on ${c.name}`);
    }
}

function fkClause(c: ColumnSpec): string | null {
    if (!c.name || !c.references) return null;
    const fkName = `fk_${c.name}_to_${c.references.table}_${c.references.column ?? "id"}`;
    const onDelete = c.references?.onDelete ? ` ON DELETE ${c.references.onDelete}` : "";
    const onUpdate = c.references?.onUpdate ? ` ON UPDATE ${c.references.onUpdate}` : "";
    return `CONSTRAINT ${q(fkName)} FOREIGN KEY (${q(c.name)}) REFERENCES ${q(
        c.references.table
    )} (${q(c.references.column ?? "id")})${onDelete}${onUpdate}`;
}

function constraintLine(type: "unique" | "index", table: string, cols: string[], name?: string, unique?: boolean) {
    const idxName = name || `${type === "unique" || unique ? "uq" : "idx"}_${table}_${cols.join("_")}`;
    const colsSql = cols.map(q).join(", ");
    if (type === "unique" || unique) return `CONSTRAINT ${q(idxName)} UNIQUE (${colsSql})`;
    return `INDEX ${q(idxName)} (${colsSql})`;
}

export function renderCreateTable(t: BuiltTable): string {
    const lines: string[] = [];
    for (const c of t.columns) lines.push(...columnLine(c));
    for (const c of t.columns) { const fk = fkClause(c); if (fk) lines.push(fk); }
    // move named per-column uniques to table level
    for (const c of t.columns) {
        if (c.name && typeof c.unique === "string") {
            lines.push(constraintLine("unique", t.name, [c.name], c.unique, true));
        }
    }
    for (const con of t.constraints) lines.push(constraintLine(con.type, t.name, con.cols, con.name, con.unique));
    const body = lines.map(l => `  ${l}`).join(",\n");
    return `CREATE TABLE IF NOT EXISTS ${q(t.name)} (\n${body}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
}

export class MariadbBlueprint extends Blueprint {
    constructor(name: string = 'default') { super(name); }

    override buildCreate(def?: TableDefFn): string {
        const built = this.buildPayload(def) as unknown as BuiltTable;
        return renderCreateTable(built);
    }

    override buildDrop(): string {
        return `DROP TABLE IF EXISTS ${q(this.tableName)};`;
    }
}

export default MariadbBlueprint;
