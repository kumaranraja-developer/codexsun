// cortex/cli/usage/create-help.ts
export function showMigrationCreateUsage() {
    console.log(`
Usage:
  cx migration create <name> [--profile=NAME] [--dir=PATH]

Options:
  --profile=NAME   Select profile (default, BLUE, SANDBOX)
  --dir=PATH       Where to place the migration (default: cortex/migrations)
  --help           Show this usage message

Examples:
  pnpm cx migration create init_schema
  pnpm cx migration create add_users_table --profile=SANDBOX
  pnpm cx migration create add_indexes --dir=packages/db/migrations
  `.trim());
}
