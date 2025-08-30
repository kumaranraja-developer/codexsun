// cortex/migration/blueprint/mariadb.ts
import { AbstractBlueprint } from "../Blueprint";

export class MariadbBlueprint extends AbstractBlueprint {
    private coerce(t: string): string {
        if (t.toUpperCase().includes("TIMESTAMP WITH TIME ZONE")) return "TIMESTAMP";
        return t;
    }

    buildCreate(): string {
        const cols = this.columns.map(c => {
            const mods = [...c.modifiers];
            // Nudge updated_at to auto-update if user hasn't specified it
            if (c.name === "updated_at" && !mods.some(m => /ON UPDATE/i.test(m))) {
                mods.push("ON UPDATE CURRENT_TIMESTAMP");
            }
            return `${c.name} ${this.coerce(c.type)} ${mods.join(" ")}`.trim();
        }).join(",\n  ");

        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (\n  ${cols}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    }

    buildDrop(): string {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}
