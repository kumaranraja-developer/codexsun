import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/** Normalize to an absolute, canonical OS path (Windows/Linux safe). */
function normalizeAbs(p: string): string {
    const abs = path.isAbsolute(p) ? p : path.resolve(p);
    // realpathSync collapses weird segments and resolves symlinks
    return fs.existsSync(abs) ? fs.realpathSync(abs) : abs;
}

/** Find migration files across all apps and sort by numeric prefix (e.g., 0001_*). */
export function discoverMigrationFiles(repoRoot = process.cwd()): string[] {
    const root = normalizeAbs(repoRoot);
    const appsDir = normalizeAbs(path.join(root, "apps"));

    const appFolders = safeList(appsDir)
        .map((f) => path.join(appsDir, f))
        .filter((p) => safeIsDir(p));

    const candidateDirs = [
        (appAbs: string) => path.join(appAbs, "database", "migrate", "tables"),
        (appAbs: string) => path.join(appAbs, "database", "migrations"),
    ];

    const files: string[] = [];

    for (const appAbs of appFolders) {
        for (const dirFn of candidateDirs) {
            const dir = normalizeAbs(dirFn(appAbs));
            for (const entry of safeList(dir)) {
                // ignore .d.ts, keep .ts/.js/.mjs/.cjs
                if (!/\.(ts|js|mjs|cjs)$/.test(entry) || /\.d\.ts$/.test(entry)) continue;
                const full = normalizeAbs(path.join(dir, entry));
                files.push(full);
            }
        }
    }

    // sort by numeric prefix: 0001_*, 0002_* …
    files.sort((a, b) => (orderOf(a) ?? 0) - (orderOf(b) ?? 0));
    return files;
}

/** Robust dynamic import for local files (Windows-safe). */
export async function dynamicImportFile(fullPath: string): Promise<any> {
    const abs = normalizeAbs(fullPath);

    if (!fs.existsSync(abs)) {
        // Helpful, exact, absolute path
        throw new Error(`discover: file not found on disk: ${abs}`);
    }

    // Convert to a proper file:// URL using Node’s helper (fixes Windows issues)
    const url = pathToFileURL(abs).href;
    return import(url);
}

// ---------- internals ----------
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
