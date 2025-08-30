// cortex/migration/blueprint/sqlite.ts
import { BaseBlueprint, ColumnSpec, sqlIdent, sqlDefaultLiteral } from "../Blueprint";

export class SqliteBlueprint extends BaseBlueprint {
    buildCreate(): string {
        this.ensureTable();
        const lines: string[] = this.renderColumns("sqlite");
        return [
            `CREATE TABLE IF NOT EXISTS ${sqlIdent(this.tableName)} (`,
            lines.map(l => `  ${l}`).join(",\n"),
            `);`,
            "",
        ].join("\n");
    }

    buildDrop(): string {
        this.ensureTable();
        return `DROP TABLE IF EXISTS ${sqlIdent(this.tableName)};`;
    }

    private renderColumns(_driver: "sqlite"): string[] {
        return this.cols.map(c => {
            switch (c.kind) {
                case "id_text_primary": {
                    // TEXT PRIMARY KEY in SQLite implicitly NOT NULL
                    return `${sqlIdent(c.name)} TEXT PRIMARY KEY`;
                }
                case "text": {
                    // SQLite ignores length, use TEXT
                    const parts = [`${sqlIdent(c.name)} TEXT`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "sqlite");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "integer": {
                    const parts = [`${sqlIdent(c.name)} INTEGER`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "sqlite");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "decimal": {
                    // SQLite numeric affinity
                    const parts = [`${sqlIdent(c.name)} NUMERIC`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "sqlite");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "timestamp": {
                    const parts = [`${sqlIdent(c.name)} TIMESTAMP`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    const def = sqlDefaultLiteral(c.default, "sqlite");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
            }
        });
    }
}
