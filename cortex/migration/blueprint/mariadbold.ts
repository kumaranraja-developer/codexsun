// cortex/migration/mariadb/Blueprint.ts

export type ColumnType = "TEXT" | "INTEGER" | "DECIMAL" | "TIMESTAMP";

export interface ColumnSpec {
    name: string;
    type: ColumnType;
    constraints: string[];
}

class ColumnChain {
    constructor(private col: ColumnSpec) {}
    unique() { this.col.constraints.push("UNIQUE"); return this; }
    notnull() { this.col.constraints.push("NOT NULL"); return this; }
    default(value: string | number) {
        this.col.constraints.push(typeof value === "string" ? `DEFAULT '${value}'` : `DEFAULT ${value}`);
        return this;
    }
}

export class MariadbBlueprint {
    readonly name: string;

    private columns: ColumnSpec[] = [];

    // DEFAULTS (changed): make these on by default so suffix always appears
    private engine?: string;         // e.g. "InnoDB"
    private charsetOpt?: string;     // e.g. "utf8mb4"
    private collateOpt?: string;     // e.g. "utf8mb4_unicode_ci"

    private utcMode = false;         // leave UTC opt-in (timestamps() same as before)

    constructor(name: string) {
        this.name = name;
        // <-- Set your desired defaults so suffix is always printed
        this.engine = "InnoDB";
        this.charsetOpt = "utf8mb4";
        this.collateOpt = "utf8mb4_unicode_ci";
    }

    // Options (still overrideable)
    innodb() { this.engine = "InnoDB"; return this; }
    utc() { this.utcMode = true; return this; }
    charset(charset: string, collate?: string) {
        this.charsetOpt = charset;
        if (collate) this.collateOpt = collate;
        return this;
    }

    // Columns
    private addColumn(name: string, type: ColumnType) {
        const col: ColumnSpec = { name, type, constraints: [] };
        this.columns.push(col);
        return new ColumnChain(col);
    }

    id() { this.columns.push({ name: "id", type: "TEXT", constraints: ["PRIMARY KEY"] }); return this; }
    text(name: string) { return this.addColumn(name, "TEXT"); }
    integer(name: string) { return this.addColumn(name, "INTEGER"); }
    decimal(name: string) { return this.addColumn(name, "DECIMAL"); }

    timestamps(includeUpdated = true) {
        if (this.utcMode) {
            this.columns.push({ name: "created_at", type: "TIMESTAMP", constraints: ["NOT NULL", "DEFAULT CURRENT_TIMESTAMP"] });
            if (includeUpdated) {
                this.columns.push({
                    name: "updated_at",
                    type: "TIMESTAMP",
                    constraints: ["NOT NULL", "DEFAULT CURRENT_TIMESTAMP", "ON UPDATE CURRENT_TIMESTAMP"],
                });
            }
        } else {
            this.columns.push({ name: "created_at", type: "TIMESTAMP", constraints: [] });
            if (includeUpdated) this.columns.push({ name: "updated_at", type: "TIMESTAMP", constraints: [] });
        }
        return this;
    }

    hasColumns() { return this.columns.length > 0; }

    toSQL(): string {
        const cols = this.columns.map((c) => {
            const cons = c.constraints.length ? " " + c.constraints.join(" ") : "";
            return `  ${c.name} ${c.type}${cons}`;
        });

        let create = `CREATE TABLE IF NOT EXISTS ${this.name} (\n${cols.join(",\n")}\n)`;

        const suffix: string[] = [];
        if (this.engine)     suffix.push(`ENGINE=${this.engine}`);
        if (this.charsetOpt) suffix.push(`DEFAULT CHARSET=${this.charsetOpt}`);
        if (this.collateOpt) suffix.push(`COLLATE=${this.collateOpt}`);

        if (suffix.length) create += " " + suffix.join(" ");

        return create + ";";
    }
}