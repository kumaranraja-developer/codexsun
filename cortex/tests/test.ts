// cortex/tests/test.ts
// Minimal test entry: just loads .env and runs the cfg tests.
import 'dotenv/config';
import { runAllCfgTests } from './cfg_test';

async function main() {
    await runAllCfgTests();
}

main().catch((e) => {
    console.error('[test] fatal', e);
    process.exit(1);
});
