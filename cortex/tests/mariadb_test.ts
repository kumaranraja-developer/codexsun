import "dotenv/config";
import mariadb from "mariadb";

const pool = mariadb.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "testdb",
    connectionLimit: 5,
    // optional timeouts:
    acquireTimeout: 15000,
    connectTimeout: 5000,
    idleTimeout: 10000,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sql, params);
        return rows as T;
    } finally {
        if (conn) conn.release();
    }
}

export async function endPool() {
    await pool.end();
}
