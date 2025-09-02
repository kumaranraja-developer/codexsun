export function showFilenamesUsage() {
    console.log(`
===========================================
📛 Fix Filenames - Usage
===========================================

Scan and rename files to kebab-case.

Commands:
  pnpm cx filenames scan [folder]   Preview files (default: project root)
  pnpm cx filenames fix [folder]    Interactive mode (ask per file)
  pnpm cx filenames fix --all       Rename all files automatically
  pnpm cx filenames fix --dry       Dry run (simulate only)

Examples:
  pnpm cx filenames scan
  pnpm cx filenames scan apps/cxsun/modules/user
  pnpm cx filenames fix cortex/framework/domain
`);
}
