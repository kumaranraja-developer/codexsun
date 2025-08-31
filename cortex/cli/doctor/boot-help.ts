// cortex/cli/boot-help.ts

export function showBootUsage() {
    console.log(
        `Usage:
  cx doctor boot [--profile=NAME]

Options:
  --profile=NAME   Select profile (default, BLUE, SANDBOX)
  --help           Show this usage message

Examples:
  pnpm cx doctor boot
  pnpm cx doctor boot --profile=SANDBOX
  pnpm cx doctor boot --profile=BLUE`
    );
}
