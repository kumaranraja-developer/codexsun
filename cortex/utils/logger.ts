// cortex/utils/logger.ts
// Tiny color + log helpers usable everywhere (ESM-safe).

const ansi = {
    reset: '\x1b[0m',
    bold:  '\x1b[1m',
    red:   '\x1b[31m',
    green: '\x1b[32m',
    yellow:'\x1b[33m',
    blue:  '\x1b[34m',
    magenta:'\x1b[35m',
    cyan:  '\x1b[36m',
    gray:  '\x1b[90m',
};

export const color = {
    bold:  (s: string) => `${ansi.bold}${s}${ansi.reset}`,
    red:   (s: string) => `${ansi.red}${s}${ansi.reset}`,
    green: (s: string) => `${ansi.green}${s}${ansi.reset}`,
    yellow:(s: string) => `${ansi.yellow}${s}${ansi.reset}`,
    blue:  (s: string) => `${ansi.blue}${s}${ansi.reset}`,
    magenta:(s: string) => `${ansi.magenta}${s}${ansi.reset}`,
    cyan:  (s: string) => `${ansi.cyan}${s}${ansi.reset}`,
    gray:  (s: string) => `${ansi.gray}${s}${ansi.reset}`,
};

export const log = {
    info:   (...a: any[]) => console.log(color.cyan('[info]'), ...a),
    ok:     (...a: any[]) => console.log(color.green('✔'), ...a),
    warn:   (...a: any[]) => console.warn(color.yellow('[warn]'), ...a),
    error:  (...a: any[]) => console.error(color.red('[error]'), ...a),
    header: (title: string) => console.log('\n' + color.bold(title)),
};
