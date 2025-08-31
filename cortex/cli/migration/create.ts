// cortex/cli/migration/create.ts
import fs from "node:fs";
import path from "node:path";

function pad(n: number, size = 2) {
    return String(n).padStart(size, "0");
}

// Timestamp like 20250831_104512 (local time). Adjust if you prefer UTC.
function makeTimestamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

function sanitizeName(name: string) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function defaultDir(flags: Record<string, string | boolean>) {
    const dirFlag = typeof flags.dir === "string" ? flags.dir : null;
    return path.resolve(process.cwd(), dirFlag ?? "cortex/migrations");
}

function migrationTemplate(name: string, profile?: string) {
    const createdAt = new Date().toISOString();
    return `/**
 * Migration: ${name}
 * Created: ${createdAt}
 * Profile: ${profile ?? "default"}
 *
 * Write your migration in the \`up\` function and rollback in \`down\`.
 * You can import your project's DB Engine types if needed.
 */

export async function up(/* db?: unknown */): Promise<void> {
  // TODO: implement the forward migration
}

export async function down(/* db?: unknown */): Promise<void> {
  // TODO: implement the rollback
}
`;
}

export async function createMigration(name: string, flags: Record<string, string | boolean>) {
    const ts = makeTimestamp();
    const safe = sanitizeName(name) || "migration";
    const dir = defaultDir(flags);

    fs.mkdirSync(dir, { recursive: true });

    const fileName = `${ts}__${safe}.ts`;
    const filePath = path.join(dir, fileName);

    if (fs.existsSync(filePath)) {
        throw new Error(`Migration already exists: ${filePath}`);
    }

    const profile = typeof flags.profile === "string" ? flags.profile : undefined;
    fs.writeFileSync(filePath, migrationTemplate(safe, profile), "utf8");

    return filePath;
}
