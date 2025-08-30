// cortex/migration/Builder.ts

export type TableDef = {
    name: string;        // e.g. "tenants"
    content: string[];   // raw lines collected inside the callback
};

export type TableCollector = {
    line: (text: string) => void;     // add one line
    lines: (...rows: string[]) => void; // add many lines
};

/**
 * defineTable("tenants", (table) => { table.line("..."); ... })
 * Returns a plain { name, content } object (no formatting, no SQL).
 */
export function defineTable(
    name: string,
    cb: (table: TableCollector) => void
): TableDef {
    const buf: string[] = [];
    const table: TableCollector = {
        line: (text: string) => buf.push(text),
        lines: (...rows: string[]) => buf.push(...rows),
    };
    cb(table);
    return { name, content: buf };
}
