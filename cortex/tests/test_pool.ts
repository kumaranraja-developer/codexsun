import { query, endPool } from "./mariadb_test";

async function main() {
    // 1) Reachability probe
    const now = await query<{ now: Date }[]>("SELECT NOW() AS now");
    console.log("DB time:", now[0]?.now);

    // 2) Create a test table
    await query(`
    CREATE TABLE IF NOT EXISTS pool_test (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // 3) Insert a row
    const name = "alice";
    await query("INSERT INTO pool_test (name) VALUES (?)", [name]);

    // 4) Select rows
    const rows = await query<Array<{ id: number; name: string; created_at: string }>>(
        "SELECT id, name, created_at FROM pool_test ORDER BY id DESC LIMIT 5"
    );
    console.log("Recent rows:", rows);

    // 5) Cleanup (optional)
    // await query("TRUNCATE TABLE pool_test");

    await endPool();
}

main().catch((err) => {
    console.error("Test failed:", err);
    // ensure pool closes on error too
    endPool().finally(() => process.exit(1));
});
