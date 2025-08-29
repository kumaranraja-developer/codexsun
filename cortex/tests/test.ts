// cortex/tests/test.ts
// Minimal test entry: just loads .env and runs the cfg tests.
import 'dotenv/config';
import { runAllCfgTests } from './cfg_test';
import { runEngineSmoke } from './engine_smoke';

async function main() {
    await runAllCfgTests();   // validates .env-driven DB configs
    await runEngineSmoke();   // validates engine wiring per profile
}

main().catch((e) => {
    console.error('[test] fatal', e);
    process.exit(1);
});
