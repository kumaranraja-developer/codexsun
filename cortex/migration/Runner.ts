// cortex/migration/Runner.ts
import fs from "fs";
import path from "path";
import { Builder } from "./Builder";

type TableModule = { default: { tableName: string; def: (t: any) => void } };

export interface RunOutput {
    results: Array<{ name: string; content: string; file: string }>;
}

/**
 * Old runner behavior: it doesn't know/care about drivers.
 * It just instantiates Builder() and feeds definitions.
 */
export async function runMigrations(arg?: { print?: boolean }): Promise<RunOutput> {
    const print = arg?.print ?? true;

    const repoRoot = process.cwd();
    const appsDir = path.resolve(repoRoot, "apps");
    const appFolders = safeList(appsDir).filter((f) => safeIsDir(path.join(appsDir, f)));

    const candidateDirs = [
        (app: string) => path.join(appsDir, app, "database", "migrate", "tables"),
        (app: string) => path.join(appsDir, app, "database", "migrations"),
    ];

    const files: string[] = [];
    for (const app of appFolders) {
        for (const dirFn of candidateDirs) {
            const migrationsDir = dirFn(app);
            for (const f of safeList(migrationsDir)) {
                if (/\.(ts|js|mjs|cjs)$/.test(f)) files.push(path.join(migrationsDir, f));
            }
        }
    }

    // sort by numeric prefix (e.g., 0001_*)
    files.sort((a, b) => (orderOf(a) ?? 0) - (orderOf(b) ?? 0));

    // 👇 Builder resolves DBConfig & picks dialect internally
    const builder = new Builder();

    const results: Array<{ name: string; content: string; file: string }> = [];

    for (const full of files) {
        const mod = (await dynamicImport(full)) as TableModule;
        const defObj = mod?.default;
        if (!defObj?.tableName || typeof defObj?.def !== "function") continue;

        const out = builder.buildCreateTable(defObj.tableName, defObj.def, { file: full });

        if (print) {
            console.log(out.name);
            console.log("content");
            console.log(out.content);
        }

        results.push({ ...out, file: full });
    }

    return { results };
}

// ——— helpers ———
function orderOf(p: string): number | undefined {
    const base = path.basename(p);
    const m = base.match(/^(\d{3,})[_\-\.]/);
    if (!m) return undefined;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : undefined;
}
function safeList(dir: string): string[] {
    try { return fs.readdirSync(dir); } catch { return []; }
}
function safeIsDir(p: string): boolean {
    try { return fs.statSync(p).isDirectory(); } catch { return false; }
}
async function dynamicImport(fullPath: string): Promise<any> {
    const abs = path.resolve(fullPath).replace(/\\/g, "/");
    const url = abs.startsWith("/") ? `file://${abs}` : `file:///${abs}`;
    return import(url);
}
