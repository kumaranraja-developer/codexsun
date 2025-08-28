// root/cortex/cli/doctor/_runner.ts

type Runner = () => Promise<boolean>;

export async function runOrWatch(label: string, cb: Runner, watch = false, intervalMs = 3000) {
    if (!watch) {
        const ok = await cb();
        process.exitCode = ok ? 0 : 1;
        return;
    }

    // watch mode
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const t0 = Date.now();
        const ok = await cb();
        const took = Date.now() - t0;
        const pad = Math.max(0, intervalMs - took);
        await new Promise((r) => setTimeout(r, pad));
    }
}

export function ok(msg: string) {
    console.log(`✅ ${msg}`);
}
export function warn(msg: string) {
    console.log(`⚠️  ${msg}`);
}
export function err(msg: string) {
    console.error(`❌ ${msg}`);
}
export function sep(title: string) {
    console.log(`\n— ${title} —`);
}
