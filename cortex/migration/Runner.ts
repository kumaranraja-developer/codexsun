// cortex/migration/Runner.ts
import fs from "fs";
import path from "path";
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
            .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".mts"))
            .map((f) => path.join(migrationsDir, f));
        files.push(...found);
    }

    const ok: (TableDef & { _file: string; _ts: number })[] = [];
    const failed: { file: string; error: unknown }[] = [];

    for (const full of files) {
        try {
            const mod = await dynamicImport(full); // ✅ safe file:// URL
            const def: TableDef | undefined = mod?.default;
            if (!def) {
                failed.push({ file: full, error: new Error("No default export (TableDef) found") });
                continue;
            }
            ok.push({
                ...(def as any),
                _file: full,
                _ts: extractTs(path.basename(full)) ?? Number.MAX_SAFE_INTEGER,
            });
        } catch (err) {
            failed.push({ file: full, error: err });
            continue;
        }
    }

    // Order successful defs by timestamp then filename
    ok.sort((a, b) => a._ts - b._ts || a._file.localeCompare(b._file));

    // Print successes
    for (const d of ok) {
        console.log(d.name);
        console.log("content");
        if ("sql" in d && typeof (d as any).sql === "string") {
            console.log((d as any).sql.trim());
        } else if ("content" in d && Array.isArray((d as any).content)) {
            for (const ln of (d as any).content) console.log(ln);
        }
        console.log("");
    }

    // Print failures at the end (do not crash the run)
    if (failed.length) {
        console.log("=== migration import errors ===");
        for (const f of failed) {
            console.log(`-- ${f.file}`);
            const msg = f.error instanceof Error ? f.error.message : String(f.error);
            console.log(msg);
            if (f.error instanceof Error && f.error.stack) {
                // print only the first line of the stack to keep it concise
                const firstStack = f.error.stack.split("\n").slice(1, 3).join("\n");
                console.log(firstStack);
            }
            console.log("");
        }
    }
}

function extractTs(base: string): number | undefined {
    const m = base.match(/^(\d{3,})[_\-\.]/);
    if (!m) return undefined;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : undefined;
}
function safeList(dir: string): string[] { try { return fs.readdirSync(dir); } catch { return []; } }
function safeIsDir(p: string): boolean { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

// Always use a proper file:// URL (Windows-friendly).
async function dynamicImport(fullPath: string): Promise<any> {
    const abs = path.resolve(fullPath).replace(/\\/g, "/");
    const url = abs.startsWith("/") ? `file://${abs}` : `file:///${abs}`;
    return import(url);
}
