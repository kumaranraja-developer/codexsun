import path from "node:path";

export type Driver = "sqlite" | "postgres" | "mariadb";

export type Settings = {
    driver: Driver;
    scope: string;
    sqlite: { file: string };
    postgres: {
        connectionString?: string;
        host?: string; port?: number; user?: string; password?: string; database?: string;
    };
    mariadb: {
        connectionString?: string;
        host?: string; port?: number; user?: string; password?: string; database?: string;
    };
};

function normalizeDriver(v: string | undefined): Driver {
    const s = (v ?? "").toLowerCase().trim();
    if (s === "postgres" || s === "pg" || s === "postgress") return "postgres";
    if (s === "mariadb" || s === "mysql") return "mariadb";
    return "sqlite";
}

/** Load .env (if dotenv is present) and build normalized settings for a scope/app. */
export async function getSettings(scope = "default"): Promise<Settings> {
    try { const { config } = await import("dotenv"); config(); } catch {}

    const DRIVER = process.env[`DB_DRIVER_${scope.toUpperCase()}`] || process.env.DB_DRIVER;
    const driver = normalizeDriver(DRIVER);

    const sqliteFile =
        process.env[`SQLITE_FILE_${scope.toUpperCase()}`] ||
        process.env.SQLITE_FILE ||
        path.join(process.cwd(), "data", `${scope}.sqlite`);

    const postgres = {
        connectionString: process.env.DATABASE_URL,
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE
    };

    const mariadb = {
        connectionString: process.env.MARIADB_URL || process.env.MYSQL_URL,
        host: process.env.MARIADB_HOST || process.env.MYSQL_HOST,
        port: process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT)
            : process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined,
        user: process.env.MARIADB_USER || process.env.MYSQL_USER,
        password: process.env.MARIADB_PASSWORD || process.env.MYSQL_PASSWORD,
        database: process.env.MARIADB_DATABASE || process.env.MYSQL_DATABASE
    };

    return {
        driver,
        scope,
        sqlite: { file: path.resolve(sqliteFile) },
        postgres,
        mariadb
    };
}
