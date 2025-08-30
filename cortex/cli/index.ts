// cortex/cli/index.ts


export type CommandHandler = (args: string[]) => Promise<void> | void;

type LoadedModule =
    | { default?: Function; handle?: Function; [k: `handle${string}`]: Function | undefined }
    | Record<string, unknown>;

/* ---------------------------------------------------------------------------------------------- */
/* Command Loaders                                                                                */
/* ---------------------------------------------------------------------------------------------- */

const loaders: Record<string, () => Promise<LoadedModule>> = {
    // Doctor commands: cx doctor <boot|database|migrate|apps|providers> [--watch]
    doctor: () => import("./doctor/index"),

    // Migrations CLI:
    migrate: () => import("./migration/migrator"),

    // Add more commands here as you grow:
    // serve:   () => import("./serve/index"),
    // seed:    () => import("../database/seed"),
};

/* ---------------------------------------------------------------------------------------------- */
/* Handler Resolution                                                                              */

/* ---------------------------------------------------------------------------------------------- */

function pickHandler(mod: LoadedModule, cmd: string): Function {
    // Prefer an explicitly named handler first (e.g., handleDoctor), then generic `handle`, then `default`.
    const byName = (mod as any)[`handle${cmd[0].toUpperCase()}${cmd.slice(1)}`];
    const generic = (mod as any).handle;
    const def = (mod as any).default;

    const fn = byName || generic || def;
    if (typeof fn === "function") return fn;

    throw new Error(`Module for "${cmd}" does not export a handler function`);
}

/**
 * Invoke a handler that may accept (args: string[]) or (...args: string[]).
 * We check arity to decide how to call it, but still allow flexible signatures.
 */
function invokeHandler(fn: Function, args: string[]) {
    try {
        // If the function expects 0 or 1 parameter, pass the single array.
        // If it expects more than 1 parameter, spread the args.
        return fn.length <= 1 ? fn(args) : fn(...args);
    } catch (err) {
        throw err;
    }
}

/* ---------------------------------------------------------------------------------------------- */
/* Usage / Help                                                                                    */

/* ---------------------------------------------------------------------------------------------- */

function usage(available: string[]) {
    const list = available.length ? available.join(", ") : "(none)";
    return `Usage: cx <command> [...args]

Available commands:
  ${list}

Examples:
  cx doctor boot
  cx doctor database --watch
  cx migrate --all
  cx rollback --app cxsun --steps 1
  cx fresh --all
`;
}

/* ---------------------------------------------------------------------------------------------- */
/* Entry                                                                                           */

/* ---------------------------------------------------------------------------------------------- */

export async function runCli(argv: string[] = process.argv): Promise<void> {
    const [, , rawCmd = "", ...args] = argv;
    const cmd = String(rawCmd || "").trim();
    const available = Object.keys(loaders);

    if (!cmd) {
        console.error(usage(available));
        process.exitCode = 1;
        return;
    }

    const loader = loaders[cmd];
    if (!loader) {
        console.error(`Unknown command: ${cmd}\n`);
        console.error(usage(available));
        process.exitCode = 1;
        return;
    }

    // Dynamically import the command module and pick its handler
    let mod: LoadedModule;
    try {
        mod = await loader();
    } catch (e: any) {
        console.error(`Failed to load command "${cmd}": ${e?.message || e}`);
        process.exitCode = 1;
        return;
    }

    const handler = pickHandler(mod, cmd);

    // Run the command (supports both (args) and (...args) styles)
    const result = invokeHandler(handler, args);
    if (result && typeof (result as Promise<void>).then === "function") {
        await result;
    }
}
