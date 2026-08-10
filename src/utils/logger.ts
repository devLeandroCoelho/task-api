type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
  if (entry.meta && Object.keys(entry.meta).length > 0) {
    return `${base} ${JSON.stringify(entry.meta)}`;
  }
  return base;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { timestamp: getTimestamp(), level: 'info', message, meta };
    console.log(formatLog(entry));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { timestamp: getTimestamp(), level: 'warn', message, meta };
    console.warn(formatLog(entry));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { timestamp: getTimestamp(), level: 'error', message, meta };
    console.error(formatLog(entry));
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = { timestamp: getTimestamp(), level: 'debug', message, meta };
      console.debug(formatLog(entry));
    }
  },
};
