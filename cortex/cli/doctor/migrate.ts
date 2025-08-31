// cortex/cli/doctor/migrate.ts
import "dotenv/config";
import path from "node:path";
import { pathToFileURL } from "node:url";

type RunnerLike = {
    fresh?: () => Promise<void> | void;
    refresh?: () => Promise<void> | void;
    up?: () => Promise<void> | void;
    down?: () => Promise<void> | void;
    default?: any;
};

const ACTIONS = new Set(["fresh", "refresh", "up", "down"]);

function candidates(): string[] {
    // normal dev path (tsx) + compiled fallback
    const root = process.cwd();
    return [
        path.resolve(root, "cortex/migration/Runner.ts"),
        path.resolve(root, "cortex/migration/Runner.js"),
    ];
}

async function importRunner(): Promise<RunnerLike> {
    let lastErr: unknown;
    for (const p of candidates()) {
        try {
            const m = await import(pathToFileURL(p).href);
            return m as RunnerLike;
        } catch (e) {
            lastErr = e;
        }
    }
    throw new Error(`Cannot load cortex/migration/Runner.{ts,js}. Last error: ${String(lastErr)}`);
}

function getFn(m: RunnerLike, action: string) {
    if ((m as any)[action] && typeof (m as any)[action] === "function") return (m as any)[action];
    if (m.default && typeof m.default[action] === "function") return m.default[action].bind(m.default);
    return null;
}

export async function runMigrate(action: string, flags: Record<string, any> = {}) {
    if (!ACTIONS.has(action)) {
        throw new Error(`Unknown migrate action "${action}". Try one of: ${[...ACTIONS].join(", ")}`);
    }

    if (flags.profile) process.env.DB_PROFILE = String(flags.profile);

    console.log(`—— Migration: ${action} ——`);
    const mod = await importRunner();
    const fn = getFn(mod, action);
    if (!fn) {
        throw new Error(
            `Runner missing "${action}". Export it as a named export or default object with that method.`
        );
    }
    await fn();
    console.log(`✅ migrations: ${action} complete`);
}
