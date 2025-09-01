// cortex/utils/server-logger.ts
import os from "os";

export interface FastifyLog {
  level: number;
  time: number;
  pid: number;
  hostname: string;
  reqId: string;
  res?: {
    statusCode: number;
  };
  responseTime?: number;
  msg: string;
}

function formatDate(epoch: number): string {
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function colorize(level: number, text: string): string {
  switch (level) {
    case 10: return colors.gray + text + colors.reset;    // TRACE
    case 20: return colors.blue + text + colors.reset;    // DEBUG
    case 30: return colors.green + text + colors.reset;   // INFO
    case 40: return colors.yellow + text + colors.reset;  // WARN
    case 50: return colors.red + text + colors.reset;     // ERROR
    case 60: return colors.magenta + text + colors.reset; // FATAL
    default: return text;
  }
}

export function formatServerLog(log: FastifyLog): string {
  const date = formatDate(log.time);

  const levelMap: Record<number, string> = {
    10: "TRACE",
    20: "DEBUG",
    30: "INFO",
    40: "WARN",
    50: "ERROR",
    60: "FATAL",
  };

  const levelText = levelMap[log.level] || `LVL${log.level}`;
  const coloredLevel = colorize(log.level, levelText);

  const status = log.res?.statusCode ? ` status=${log.res.statusCode}` : "";
  const response =
    log.responseTime !== undefined
      ? ` responseTime=${log.responseTime.toFixed(2)}ms`
      : "";

  return `[${date}] [${coloredLevel}] (pid=${log.pid} host=${log.hostname} reqId=${log.reqId}) ${log.msg}${status}${response}`.trim();
}

/**
 * Simple helper to log a one-off message using the same formatting/colors.
 * Useful for startup/shutdown messages.
 */
export function ServerLogger(message: string): void {
  const log: FastifyLog = {
    level: 30,
    time: Date.now(),
    pid: process.pid,
    hostname: os.hostname(),
    reqId: "startup",
    msg: message,
  };
  // eslint-disable-next-line no-console
  console.log(formatServerLog(log));
}
