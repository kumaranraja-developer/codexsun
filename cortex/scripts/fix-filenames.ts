#!/usr/bin/env tsx

/**
 * fix-filenames.ts
 *
 * CLI tool to rename files to kebab-case and fix import references.
 *
 * Features:
 * - Ignores folders/files from lists below
 * - Interactive (ask all vs ask each file)
 * - Dry-run mode (--dry-run)
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const projectRoot = path.resolve(process.cwd());

// -------------------------------
// 🚫 Ignore lists
// -------------------------------
const ignoreFolders = ["node_modules", "dist", "build"];
const ignoreFiles = ["fix-filenames.ts"];

// -------------------------------
// 🔍 Helpers
// -------------------------------

/** Is path ignored? */
function isIgnored(filePath: string): boolean {
    const relPath = path.relative(projectRoot, filePath);
    return (
        ignoreFolders.some((f) => relPath.startsWith(f)) ||
        ignoreFiles.some((f) => relPath.endsWith(f))
    );
}

/** Recursively scan for files */
function scanDir(dir: string): string[] {
    const result: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (isIgnored(fullPath)) continue;

        if (entry.isDirectory()) {
            result.push(...scanDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            result.push(fullPath);
        }
    }
    return result;
}

/** Convert to kebab-case filename */
function toKebabCase(filename: string): string {
    return filename
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // split camelCase
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // split PascalCase
        .toLowerCase();
}

/** Rename file + fix imports */
function renameFileAndFixImports(
    oldPath: string,
    newPath: string,
    dryRun: boolean
): number {
    if (!dryRun) {
        fs.renameSync(oldPath, newPath);
    }

    const allFiles = scanDir(projectRoot);
    let updatedCount = 0;

    for (const file of allFiles) {
        if (file === newPath) continue;
        let content = fs.readFileSync(file, "utf-8");
        const relOld = "./" + path.basename(oldPath);
        const relNew = "./" + path.basename(newPath);

        if (content.includes(relOld)) {
            content = content.replace(new RegExp(relOld, "g"), relNew);
            if (!dryRun) fs.writeFileSync(file, content, "utf-8");
            updatedCount++;
        }
    }
    return updatedCount;
}

/** Ask question in CLI */
function ask(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (ans) => {
        rl.close();
        resolve(ans.trim());
    }));
}

// -------------------------------
// 🚀 Main
// -------------------------------
(async () => {
    const dryRun = process.argv.includes("--dry-run");

    const allFiles = scanDir(projectRoot);
    const renameCandidates: { oldPath: string; newPath: string }[] = [];

    for (const file of allFiles) {
        const filename = path.basename(file);
        const kebab = toKebabCase(filename);
        if (filename !== kebab) {
            renameCandidates.push({
                oldPath: file,
                newPath: path.join(path.dirname(file), kebab),
            });
        }
    }

    if (renameCandidates.length === 0) {
        console.log("✅ No files need renaming.");
        return;
    }

    console.log(`[SCAN] Found ${renameCandidates.length} file(s) to fix.\n`);
    renameCandidates.forEach((c) =>
        console.log(`- ${path.relative(projectRoot, c.oldPath)} → ${path.basename(c.newPath)}`)
    );

    const renameAllAns = await ask(
        "\nDo you want to rename all files automatically? (y/n) "
    );

    let totalRenamed = 0;
    let totalUpdated = 0;

    for (const { oldPath, newPath } of renameCandidates) {
        let proceed = false;

        if (renameAllAns.toLowerCase() === "y") {
            proceed = true;
        } else {
            const ans = await ask(
                `Rename ${path.relative(projectRoot, oldPath)} → ${path.basename(newPath)} ? (y/n) `
            );
            proceed = ans.toLowerCase() === "y";
        }

        if (proceed) {
            console.log(`[RENAME] ${oldPath} → ${newPath}`);
            const updated = renameFileAndFixImports(oldPath, newPath, dryRun);
            totalRenamed++;
            totalUpdated += updated;
        } else {
            console.log(`[SKIP] ${oldPath}`);
        }
    }

    console.log("\n--- SUMMARY ---");
    console.log(`Renamed: ${totalRenamed}`);
    console.log(`Updated imports in: ${totalUpdated} files`);
    console.log(`Dry run: ${dryRun ? "YES" : "NO"}`);
})();
