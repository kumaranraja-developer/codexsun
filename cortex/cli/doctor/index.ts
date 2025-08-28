// root/cortex/cli/doctor/index.ts
import { runDoctorBoot } from "./boot";
import { runDoctorDatabase } from "./database";
import { runDoctorMigrate } from "./migrate";
import { runDoctorApps } from "./apps";
import { runDoctorProviders } from "./providers";

export async function handleDoctor(args: string[]) {
    // Accept: pnpm cx doctor <boot|database|migrate|apps|providers> [--watch]
    const [sub = ""] = args;
    const watch = args.includes("--watch");

    const table: Record<string, (o: { watch?: boolean }) => Promise<void>> = {
        boot: runDoctorBoot,
        database: runDoctorDatabase,
        migrate: runDoctorMigrate,
        apps: runDoctorApps,
        providers: runDoctorProviders,
    };

    const run = table[sub];
    if (!run) {
        console.error(`Usage: cx doctor <boot|database|migrate|apps|providers> [--watch]`);
        process.exit(2);
        return;
    }
    await run({ watch });
}
