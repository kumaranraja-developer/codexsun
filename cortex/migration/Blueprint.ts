// cortex/migration/Blueprint.ts

export type SqlPiece = string;

export type ColumnKind =
    | "id_text_primary"
    | "text"
    | "integer"
    | "decimal"
    | "timestamp";

export interface ColumnSpec {
    name: string;
    kind: ColumnKind;
    // optional attributes
    length?: number;       // for text/varchar
    precision?: number;    // decimal total digits
    scale?: number;        // decimal scale
    nullable?: boolean;    // default true
    unique?: boolean;
    default?: string | number | boolean | null;
}

export interface TableBlueprint {
    // lifecycle
    reset(tableName: string): void;
    buildCreate(): string;
    buildDrop(): string;

    // column DSL
    id(): ColumnBuilder;                  // alias for idTextPrimary()
    idTextPrimary(): ColumnBuilder;

    text(name: string, length?: number): ColumnBuilder;
    integer(name: string): ColumnBuilder;
    decimal(name: string, precision?: number, scale?: number): ColumnBuilder;

    // helpers
    timestamps(withDefaults?: boolean): void; // created_at / updated_at
}

/** Chainable column builder returned by DSL calls. */
export interface ColumnBuilder {
    unique(): ColumnBuilder;
    notnull(): ColumnBuilder;
    nullable(): ColumnBuilder;
    default(val: string | number | boolean | null): ColumnBuilder;
}

// ------------------ Common base (driver-agnostic storage) ------------------

abstract class BaseBlueprint implements TableBlueprint {
    protected tableName = "";
    protected cols: ColumnSpec[] = [];

    reset(tableName: string): void {
        this.tableName = tableName;
        this.cols = [];
    }

    id(): ColumnBuilder {
        return this.idTextPrimary();
    }

    idTextPrimary(): ColumnBuilder {
        const spec: ColumnSpec = { name: "id", kind: "id_text_primary", nullable: false };
        this.cols.push(spec);
        return this.wrap(spec);
    }

    text(name: string, length?: number): ColumnBuilder {
        const spec: ColumnSpec = { name, kind: "text", length, nullable: true };
        this.cols.push(spec);
        return this.wrap(spec);
    }

    integer(name: string): ColumnBuilder {
        const spec: ColumnSpec = { name, kind: "integer", nullable: true };
        this.cols.push(spec);
        return this.wrap(spec);
    }

    decimal(name: string, precision = 10, scale = 2): ColumnBuilder {
        const spec: ColumnSpec = { name, kind: "decimal", precision, scale, nullable: true };
        this.cols.push(spec);
        return this.wrap(spec);
    }

    timestamps(withDefaults = true): void {
        // created_at / updated_at
        const created: ColumnSpec = { name: "created_at", kind: "timestamp", nullable: true };
        const updated: ColumnSpec = { name: "updated_at", kind: "timestamp", nullable: true };

        if (withDefaults) {
            // each driver will translate this appropriately
            created.default = "__now__";
            updated.default = "__now__";
        }
        this.cols.push(created, updated);
    }

    protected wrap(spec: ColumnSpec): ColumnBuilder {
        return {
            unique: () => { spec.unique = true; return this.wrap(spec); },
            notnull: () => { spec.nullable = false; return this.wrap(spec); },
            nullable: () => { spec.nullable = true; return this.wrap(spec); },
            default: (val) => { spec.default = val; return this.wrap(spec); },
        };
    }

    // Driver-specific rendering
    abstract buildCreate(): string;
    abstract buildDrop(): string;

    protected ensureTable(): void {
        if (!this.tableName) throw new Error("Blueprint: tableName not set. Did you call reset(name)?");
    }
}

// ------------------ Helpers used by drivers ------------------

export function sqlIdent(name: string): string {
    // simple identity quoting if needed later; keep bare for now
    return name;
}

export function sqlDefaultLiteral(val: ColumnSpec["default"], driver: "sqlite" | "mariadb" | "postgres"): string | undefined {
    if (val === undefined) return undefined;
    if (val === "__now__") {
        if (driver === "sqlite") return "CURRENT_TIMESTAMP";
        if (driver === "mariadb") return "CURRENT_TIMESTAMP";
        if (driver === "postgres") return "CURRENT_TIMESTAMP";
    }
    if (val === null) return "NULL";
    if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
    if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
    return String(val);
}

// Expose the base so drivers can extend it.
export { BaseBlueprint };
