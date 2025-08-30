// cortex/migration/blueprint/postgres.ts
import { AbstractBlueprint } from "../Blueprint";

export class PostgresBlueprint extends AbstractBlueprint {
    private coerce(t: string): string {
        if (t.toUpperCase().includes("TIMESTAMP WITH TIME ZONE")) return "TIMESTAMPTZ";
        return t;
    }

    buildCreate(): string {
        const cols = this.columns
            .map(c => `${c.name} ${this.coerce(c.type)} ${c.modifiers.join(" ")}`.trim())
            .join(",\n  ");
        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (\n  ${cols}\n);`;
    }

    buildDrop(): string {
        // CASCADE is ergonomically safer for FK chains in test runs
        return `DROP TABLE IF EXISTS ${this.tableName} CASCADE;`;
    }
}
