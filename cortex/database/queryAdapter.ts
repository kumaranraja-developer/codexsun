// cortex/database/queryAdapter.ts
type Driver = "postgres" | "mariadb" | "sqlite" | "mysql" | "mongodb";

/** Convert ? placeholders to $1, $2... for Postgres */
export function toPgPlaceholders(sql: string): string {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

/** Convert $n placeholders back to ? (for MariaDB/SQLite safety) */
export function toQMarkPlaceholders(sql: string): string {
    if (/\$\d+/.test(sql)) {
        return sql.replace(/\$\d+/g, "?");
    }
    return sql;
}

/** Format values per driver (dates, nulls, JSON, bools, buffers, arrays, etc.) */
export function formatValue(driver: Driver, v: any): any {
    // undefined / null / string "null"
    if (v === undefined || v === null || v === "null") return null;

    // Boolean handling
    if (typeof v === "boolean") {
        if (driver === "postgres") return v;   // native boolean
        return v ? 1 : 0;                      // mariadb + sqlite expect int
    }

    // Dates
    if (v instanceof Date) {
        if (driver === "mariadb") {
            // MariaDB: "YYYY-MM-DD HH:MM:SS" (strip Z, replace T, drop ms if needed)
            return v.toISOString()
                .replace("T", " ")
                .replace("Z", "")
                .replace(/\.\d+$/, ""); // strip .000
        }

        if (driver === "mysql") {
            // MariaDB: "YYYY-MM-DD HH:MM:SS" (strip Z, replace T, drop ms if needed)
            return v.toISOString()
                .replace("T", " ")
                .replace("Z", "")
                .replace(/\.\d+$/, ""); // strip .000
        }

        if (driver === "mongodb") {
            // MariaDB: "YYYY-MM-DD HH:MM:SS" (strip Z, replace T, drop ms if needed)
            return v.toISOString()
                .replace("T", " ")
                .replace("Z", "")
                .replace(/\.\d+$/, ""); // strip .000
        }

        return v.toISOString(); // Postgres + SQLite accept ISO
    }

    // Buffers / binary
    if (Buffer.isBuffer(v)) return v;
    if (v instanceof Uint8Array) return Buffer.from(v);

    // Arrays
    if (Array.isArray(v)) {
        if (driver === "postgres") return v; // native arrays
        try {
            return JSON.stringify(v);
        } catch {
            return String(v);
        }
    }

    // Objects
    if (typeof v === "object") {
        if (driver === "postgres") return v; // pg can handle JSON directly
        try {
            return JSON.stringify(v);
        } catch {
            return String(v);
        }
    }

    // Strings → MariaDB datetime fix
    if (typeof v === "string" && driver === "mariadb" && /\d{4}-\d{2}-\d{2}T/.test(v)) {
        return v.replace("T", " ").replace("Z", "").replace(/\.\d+$/, "");
    }

    // Strings → MariaDB datetime fix
    if (typeof v === "string" && driver === "mysql" && /\d{4}-\d{2}-\d{2}T/.test(v)) {
        return v.replace("T", " ").replace("Z", "").replace(/\.\d+$/, "");
    }


    // Fallback: numbers & primitives
    return v;
}

/** Normalize params: always return an array */
export function normalizeParams(driver: Driver, params?: unknown): unknown[] {
    if (params === undefined) return [];
    if (params === null) return [null];

    if (Array.isArray(params)) {
        return params.map((p) => formatValue(driver, p));
    }

    return [formatValue(driver, params)];
}

/** Adapt SQL + params to the target driver */
export function queryAdapter(
    driver: Driver,
    sql: string,
    params?: unknown
): { sql: string; params: unknown[] } {
    let outSql = sql;

    if (driver === "postgres") {
        if (/\?/.test(sql)) outSql = toPgPlaceholders(sql);
    } else {
        // MariaDB + SQLite prefer ?
        outSql = toQMarkPlaceholders(sql);
    }

    const outParams = normalizeParams(driver, params);
    return { sql: outSql, params: outParams };
}

/** ✅ Normalize rows across drivers (always array of plain objects) */
export function rowsAdapter(driver: Driver, rows: any): any[] {
    if (!rows) return [];
    if (Array.isArray(rows)) return rows;

    // MariaDB sometimes returns objects with metadata
    if (typeof rows === "object" && rows.constructor === Object) {
        return Object.values(rows).filter((v) => typeof v === "object");
    }

    return [];
}
