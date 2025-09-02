// apps/cxsun/src/user/code/user.table.ts

export function getUserTableDDL(_dialect?: string): string {
    // Force SQLite only for now
    return `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;
}

export function dropUserTableDDL(): string {
    return `DROP TABLE IF EXISTS users`;
}
