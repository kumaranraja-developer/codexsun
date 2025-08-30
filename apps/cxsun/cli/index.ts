/**
 * apps/cxsun/cli/index.ts
 * CLI entry for cxsun (invoked via: pnpm cli cxsun <cmd> [...args])
 */
export default async function cxsunCli(argv: string[]) {
    const [cmd = "help", ...rest] = argv;
    switch (cmd) {
        case "help":
            console.log("cxsun CLI");
            console.log("Usage: pnpm cli cxsun <command>");
            console.log("Commands: greet, echo");
            break;
        case "greet":
            console.log("👋 Hello from cxsun CLI");
            break;
        case "echo":
            console.log(rest.join(" "));
            break;
        default:
            console.error(`Unknown command: ${cmd}`);
            process.exitCode = 1;
    }
}
