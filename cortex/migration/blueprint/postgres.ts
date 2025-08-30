// cortex/migration/blueprint/postgres.ts
import { BaseBlueprint, ColumnSpec, sqlIdent, sqlDefaultLiteral } from "../Blueprint";

export class PostgresBlueprint extends BaseBlueprint {
    buildCreate(): string {
        this.ensureTable();
        const cols = this.renderColumns("postgres");
        return [
            `CREATE TABLE IF NOT EXISTS ${sqlIdent(this.tableName)} (`,
            cols.map(l => `  ${l}`).join(",\n"),
            `);`,
            "",
        ].join("\n");
    }

    buildDrop(): string {
        this.ensureTable();
        return `DROP TABLE IF EXISTS ${sqlIdent(this.tableName)};`;
    }

    private renderColumns(_driver: "postgres"): string[] {
        return this.cols.map(c => {
            switch (c.kind) {
                case "id_text_primary": {
                    return `${sqlIdent(c.name)} TEXT PRIMARY KEY`;
                }
                case "text": {
                    // Use TEXT if no length; VARCHAR(n) if length provided
                    const base = c.length ? `VARCHAR(${c.length})` : "TEXT";
                    const parts = [`${sqlIdent(c.name)} ${base}`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "postgres");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "integer": {
                    const parts = [`${sqlIdent(c.name)} INTEGER`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "postgres");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "decimal": {
                    const precision = c.precision ?? 10;
                    const scale = c.scale ?? 2;
                    const parts = [`${sqlIdent(c.name)} NUMERIC(${precision},${scale})`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "postgres");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "timestamp": {
                    const parts = [`${sqlIdent(c.name)} TIMESTAMP`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    const def = sqlDefaultLiteral(c.default, "postgres");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
            }
        });
    }
}
