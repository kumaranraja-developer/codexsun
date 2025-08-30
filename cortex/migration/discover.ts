// cortex/migration/discover.ts
import fs from "fs";
import path from "path";

/** Find migration files across all apps and sort by numeric prefix (e.g. 0001_*). */
export function discoverMigrationFiles(repoRoot = process.cwd()): string[] {
    const appsDir = path.resolve(repoRoot, "apps");
    const appFolders = safeList(appsDir).filter((f) => safeIsDir(path.join(appsDir, f)));

    const candidateDirs = [
        (app: string) => path.join(appsDir, app, "database", "migrate", "tables"),
        (app: string) => path.join(appsDir, app, "database", "migrations"),
    ];

    const files: string[] = [];
    for (const app of appFolders) {
        for (const dirFn of candidateDirs) {
            const dir = dirFn(app);
            for (const f of safeList(dir)) {
                if (/\.(ts|js|mjs|cjs)$/.test(f)) files.push(path.join(dir, f));
            }
        }
    }

    files.sort((a, b) => (orderOf(a) ?? 0) - (orderOf(b) ?? 0));
    return files;
}

export async function dynamicImportFile(fullPath: string): Promise<any> {
    const abs = path.resolve(fullPath).replace(/\\/g, "/");
    const url = abs.startsWith("/") ? `file://${abs}` : `file:///${abs}`;
    return import(url);
}

// ——— internal helpers ———
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
