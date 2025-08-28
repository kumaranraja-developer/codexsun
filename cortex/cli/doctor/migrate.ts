// root/cortex/cli/doctor/migrate.ts
import fs from "node:fs";
import path from "node:path";
import { runOrWatch, ok, warn, err, sep } from "./_runner";

export async function runDoctorMigrate(opts: { watch?: boolean }) {
    await runOrWatch("migrate", async () => {
        sep("Migrate Doctor");
        const cwd = process.cwd();
        const migDir = path.join(cwd, "migrations");

        if (!fs.existsSync(migDir)) {
            warn(`No migrations directory at ${migDir}`);
            return true; // not strictly an error
        }

        const files = fs.readdirSync(migDir).filter((f) => /\.(sql|ts|js)$/.test(f)).sort();
        if (!files.length) {
            warn("Migrations directory is empty");
            return true;
        }

        ok(`Found ${files.length} migration file(s):`);
        for (const f of files) console.log(`  • ${f}`);

        // Here you could validate filename ordering, duplicate timestamps, etc.
        return true;
    }, opts.watch);
}
