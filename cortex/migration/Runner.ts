// cortex/migration/runner.ts
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { TableDef } from "./Builder";

export async function runMigrations() {
    const repoRoot = process.cwd();
    const appsDir = path.resolve(repoRoot, "apps");

    const appFolders = safeList(appsDir).filter((f) =>
        safeIsDir(path.join(appsDir, f))
    );

    const files: string[] = [];
    for (const app of appFolders) {
        const migrationsDir = path.join(appsDir, app, "database", "migrations");
        if (!fs.existsSync(migrationsDir)) continue;

        const found = safeList(migrationsDir)
            .filter((f) => f.endsWith(".ts"))
            .map((f) => path.join(migrationsDir, f));
        files.push(...found);
    }

    // import each file; its default export should be a TableDef
    const defs: TableDef[] = [];
    for (const full of files) {
        const mod = await dynamicImport(full);
        const def: TableDef | undefined = mod?.default;
        if (!def) continue;

        // derive timestamp from filename prefix like 0001_..., 20240830_...
        const ts = extractTs(path.basename(full));
        (def as any)._file = full;
        (def as any)._ts = ts ?? Number.MAX_SAFE_INTEGER;
        defs.push(def);
    }

    // order by timestamp (filename prefix)
    defs.sort((a: any, b: any) => a._ts - b._ts || String(a._file).localeCompare(String(b._file)));

    // print exactly “tenants” and then “content” lines as requested
    for (const d of defs) {
        console.log(d.name);          // e.g. "tenants"
        // console.log("content");       // literal word "content"
        for (const ln of d.content) console.log(ln);
        console.log("");              // spacer
    }
}

function extractTs(base: string): number | undefined {
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
    try { return await import(pathToFileURL(fullPath).href); }
    catch { return await import(fullPath); }
}
