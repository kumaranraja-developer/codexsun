// cortex/migration/Blueprint.ts

// ────────────────────────────────────────────────────────────────────────────
// Public contract
// ────────────────────────────────────────────────────────────────────────────
export interface ColumnDef {
    name: string;
    type: string;
    modifiers: string[];
}

export interface TableBlueprint {
    reset(tableName: string): void;

    // DSL
    idTextPrimary(): void;
    text(name: string, length?: number): ColumnBuilder;
    integer(name: string): ColumnBuilder;
    decimal(name: string, precision?: number, scale?: number): ColumnBuilder;
    timestamps(withTz?: boolean): void;

    // SQL
    buildCreate(): string;
    buildDrop(): string;

    // Optional context hook (builder will call if present)
    setContext?(ctx: unknown): void;
}

export interface ColumnBuilder {
    primary(): ColumnBuilder;
    unique(): ColumnBuilder;
    notnull(): ColumnBuilder;
    default(val: string | number | boolean | null): ColumnBuilder;
}

// ────────────────────────────────────────────────────────────────────────────
// Base implementations used by all dialects
// ────────────────────────────────────────────────────────────────────────────
export abstract class AbstractBlueprint implements TableBlueprint {
    protected tableName = "";
    protected columns: ColumnDef[] = [];
    // Context bag is optional; dialects can read if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected ctx: any = undefined;

    reset(tableName: string): void {
        this.tableName = tableName;
        this.columns = [];
    }

    setContext(ctx: unknown): void {
        this.ctx = ctx;
    }

    idTextPrimary(): void {
        this.columns.push({
            name: "id",
            type: "TEXT",
            modifiers: ["PRIMARY KEY"],
        });
    }

    text(name: string, length?: number): ColumnBuilder {
        const type = length ? `VARCHAR(${length})` : "TEXT";
        return this.pushAndWrap(name, type);
    }

    integer(name: string): ColumnBuilder {
        return this.pushAndWrap(name, "INTEGER");
    }

    decimal(name: string, precision?: number, scale?: number): ColumnBuilder {
        let type = "DECIMAL";
        if (typeof precision === "number" && typeof scale === "number") {
            type = `DECIMAL(${precision},${scale})`;
        } else if (typeof precision === "number") {
            // if only one arg provided, treat as precision with default scale
            type = `DECIMAL(${precision},2)`;
        }
        return this.pushAndWrap(name, type);
    }

    timestamps(withTz: boolean = true): void {
        const ts = withTz ? "TIMESTAMP WITH TIME ZONE" : "TIMESTAMP";
        this.columns.push({
            name: "created_at",
            type: ts,
            modifiers: ["DEFAULT CURRENT_TIMESTAMP"],
        });
        this.columns.push({
            name: "updated_at",
            type: ts,
            modifiers: ["DEFAULT CURRENT_TIMESTAMP"],
        });
    }

    // Helpers
    private pushAndWrap(name: string, type: string): ColumnBuilder {
        const col: ColumnDef = { name, type, modifiers: [] };
        this.columns.push(col);

        const builder: ColumnBuilder = {
            primary: () => {
                if (!col.modifiers.includes("PRIMARY KEY")) col.modifiers.push("PRIMARY KEY");
                return builder;
            },
            unique: () => {
                if (!col.modifiers.includes("UNIQUE")) col.modifiers.push("UNIQUE");
                return builder;
            },
            notnull: () => {
                if (!col.modifiers.some(m => m.toUpperCase() === "NOT NULL")) col.modifiers.push("NOT NULL");
                return builder;
            },
            default: (val) => {
                const lit =
                    typeof val === "string" ? `'${val.replace(/'/g, "''")}'`
                        : typeof val === "boolean" ? (val ? "TRUE" : "FALSE")
                            : val === null ? "NULL"
                                : String(val);
                col.modifiers.push(`DEFAULT ${lit}`);
                return builder;
            },
        };

        return builder;
    }

    // Dialects must implement
    abstract buildCreate(): string;
    abstract buildDrop(): string;
}
