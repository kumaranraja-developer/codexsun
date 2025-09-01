// cortex/server/mount.ts
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

/** Read subdirectories of a folder (returns [] if folder missing). */
export async function listDirs(dir: string): Promise<string[]> {
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        return items.filter(d => d.isDirectory()).map(d => d.name).sort();
    } catch {
        return [];
    }
}

/** Check if a file exists. */
export async function fileExists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

/** ESM-safe dynamic import for absolute paths (works on Windows). */
export async function importAbs(absPath: string): Promise<any> {
    const url = pathToFileURL(absPath).href;
    return import(url);
}
