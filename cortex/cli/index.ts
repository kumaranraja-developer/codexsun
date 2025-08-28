// cortex/cli/index.ts
//
// Central CLI router. Dynamically loads subcommand handlers so startup stays fast.
// Add new commands by extending the `loaders` map below.

export type CommandHandler = (args: string[]) => Promise<void> | void;

type LoadedModule =
    | { default?: CommandHandler; handle?: CommandHandler; handleDoctor?: CommandHandler }
    | Record<string, unknown>;

const loaders: Record<string, () => Promise<LoadedModule>> = {
    // Doctor commands: pnpm cx doctor <boot|database|migrate|apps|providers> [--watch]
    doctor: () => import("./doctor/index"),
    // Add more commands here, e.g.:
    // migrate: () => import("./cortex/cli/migrate/index"),
    // serve:   () => import("./cortex/cli/serve/index"),
};

function pickHandler(mod: LoadedModule, cmd: string): CommandHandler {
    // Prefer explicit named export for the command…
    const possible =
        (mod as any)[`handle${cmd[0].toUpperCase()}${cmd.slice(1)}`] ||
        (mod as any).handle ||
        (mod as any).default;

    if (typeof possible === "function") return possible as CommandHandler;
    throw new Error(`Module for "${cmd}" does not export a handler`);
}

function usage(available: string[]) {
    const list = available.length ? available.join(", ") : "(none)";
    return `Usage: cx <command> [...args]

Available commands:
  ${list}

Examples:
  cx doctor boot
  cx doctor database --watch
`;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
    const [, , rawCmd = "", ...args] = argv;
    const cmd = String(rawCmd || "").trim();

    if (!cmd) {
        console.error(usage(Object.keys(loaders)));
        process.exitCode = 1;
        return;
    }

    const loader = loaders[cmd];
    if (!loader) {
        console.error(`Unknown command: ${cmd}\n`);
        console.error(usage(Object.keys(loaders)));
        process.exitCode = 1;
        return;
    }

    // Dynamically import the command module and pick its handler
    let mod: LoadedModule;
    try {
        mod = await loader();
    } catch (e: any) {
        throw new Error(`Failed to load command "${cmd}": ${e?.message || e}`);
    }

    const handler = pickHandler(mod, cmd);

    // Run the command
    const result = handler(args);
    if (result && typeof (result as Promise<void>).then === "function") {
        await result;
    }
}
