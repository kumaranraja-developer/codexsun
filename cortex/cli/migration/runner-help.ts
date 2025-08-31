// cortex/cli/migration/runner-help.ts

export function showMigrationRunnerUsage() {
    console.log(`
Migration CLI Usage:
  pnpm cx migration <action> [options]

Actions:
  up              Apply all pending migrations
  down            Roll back the last batch of migrations
  refresh         Roll back and re-apply migrations (optionally with --steps=N)
  fresh           Drop all known tables and re-run all migrations

Options:
  --profile=<name>   Use the given DB profile (default: process.env.DB_PROFILE or "default")
  --steps=<n>        For "refresh": how many batches to roll back and re-apply
  --print=false      Suppress printing migration SQL/logs (default: true)

Examples:
  pnpm cx migration up
  pnpm cx migration down --profile=local
  pnpm cx migration refresh --steps=1
  pnpm cx migration fresh --profile=dev
`);
}
