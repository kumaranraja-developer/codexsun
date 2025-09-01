// cortex/database/queryAdapter.ts
type Driver = "postgres" | "mariadb" | "sqlite";

/** Convert ? placeholders to $1, $2... for Postgres */
function toPgPlaceholders(sql: string): string {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

/** Convert $n placeholders back to ? (for MariaDB/SQLite safety) */
function toQMarkPlaceholders(sql: string): string {
    if (/\$\d+/.test(sql)) {
        return sql.replace(/\$\d+/g, "?");
    }
    return sql;
}

/** Format values per driver (dates, nulls, JSON, etc.) */
function formatValue(driver: Driver, v: any): any {
    if (v === undefined || v === null) return null;

    // Dates
    if (v instanceof Date) {
        if (driver === "mariadb") {
            // MariaDB expects "YYYY-MM-DD HH:MM:SS.sss"
            return v.toISOString().replace("T", " ").replace("Z", "");
        }
        return v.toISOString(); // Postgres + SQLite accept ISO
    }

    // Objects/arrays → JSON for MariaDB + SQLite
    if (typeof v === "object") {
        if (driver === "mariadb" || driver === "sqlite") {
            try {
                return JSON.stringify(v);
            } catch {
                return String(v);
            }
        }
        return v; // Postgres: let driver handle JSON
    }

    // Strings for MariaDB date fix
    if (typeof v === "string" && driver === "mariadb" && /\d{4}-\d{2}-\d{2}T/.test(v)) {
        return v.replace("T", " ").replace("Z", "");
    }

    return v;
}

/** Normalize params: always return an array */
function normalizeParams(driver: Driver, params?: unknown): unknown[] {
    if (params === undefined) return [];
    if (params === null) return [null];

    if (Array.isArray(params)) {
        return params.map((p) => {
            if (p === undefined || p === null || p === "null") return null;
            return formatValue(driver, p);
        });
    }

    return [params === undefined || params === null || params === "null" ? null : formatValue(driver, params)];
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
