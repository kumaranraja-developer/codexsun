// cortex/migration/blueprint/mariadb.ts
import { BaseBlueprint, ColumnSpec, sqlIdent, sqlDefaultLiteral } from "../Blueprint";

export class MariadbBlueprint extends BaseBlueprint {
    buildCreate(): string {
        this.ensureTable();
        const cols = this.renderColumns("mariadb");
        return [
            `CREATE TABLE IF NOT EXISTS ${sqlIdent(this.tableName)} (`,
            cols.map(l => `  ${l}`).join(",\n"),
            `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
            "",
        ].join("\n");
    }

    buildDrop(): string {
        this.ensureTable();
        return `DROP TABLE IF EXISTS ${sqlIdent(this.tableName)};`;
    }

    private renderColumns(_driver: "mariadb"): string[] {
        return this.cols.map(c => {
            switch (c.kind) {
                case "id_text_primary": {
                    // Common safe length for PK text in MariaDB
                    return `${sqlIdent(c.name)} VARCHAR(191) PRIMARY KEY`;
                }
                case "text": {
                    const len = c.length ?? 255;
                    const parts = [`${sqlIdent(c.name)} VARCHAR(${len})`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "mariadb");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "integer": {
                    const parts = [`${sqlIdent(c.name)} INT`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "mariadb");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "decimal": {
                    const precision = c.precision ?? 10;
                    const scale = c.scale ?? 2;
                    const parts = [`${sqlIdent(c.name)} DECIMAL(${precision},${scale})`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    if (c.unique) parts.push("UNIQUE");
                    const def = sqlDefaultLiteral(c.default, "mariadb");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
                case "timestamp": {
                    const parts = [`${sqlIdent(c.name)} TIMESTAMP`];
                    if (c.nullable === false) parts.push("NOT NULL");
                    const def = sqlDefaultLiteral(c.default, "mariadb");
                    if (def !== undefined) parts.push(`DEFAULT ${def}`);
                    return parts.join(" ");
                }
            }
        });
    }
}
