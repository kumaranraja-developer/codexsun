// cortex/migration/blueprint/sqlite.ts
import { AbstractBlueprint } from "../Blueprint";

export class SqliteBlueprint extends AbstractBlueprint {
    private coerce(t: string): string {
        // Friendlier print for timestamps in SQLite world
        if (t.toUpperCase().includes("TIMESTAMP")) return "DATETIME";
        return t;
    }

    buildCreate(): string {
        const cols = this.columns
            .map(c => `${c.name} ${this.coerce(c.type)} ${c.modifiers.join(" ")}`.trim())
            .join(",\n  ");
        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (\n  ${cols}\n);`;
    }

    buildDrop(): string {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}
