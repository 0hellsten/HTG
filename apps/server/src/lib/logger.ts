// Logger för Stallbacken backend enligt AGENTS.md
// Inga känsliga personuppgifter får loggas här.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctxString = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxString}`;
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(this.formatMessage('debug', message, context) + '\n');
    }
  }

  info(message: string, context?: LogContext): void {
    process.stdout.write(this.formatMessage('info', message, context) + '\n');
  }

  warn(message: string, context?: LogContext): void {
    process.stderr.write(this.formatMessage('warn', message, context) + '\n');
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack, ...context } 
      : { rawError: String(error), ...context };

    process.stderr.write(this.formatMessage('error', message, errorDetails) + '\n');
  }
}

export const logger = new Logger();
