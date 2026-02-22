type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

class Logger {
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${args.length ? JSON.stringify(args) : ''}`;
  }

  debug(message: string, ...args: unknown[]) {
    if (isDev) console.debug(this.formatMessage('debug', message, ...args));
  }

  info(message: string, ...args: unknown[]) {
    if (isDev) console.info(this.formatMessage('info', message, ...args));
  }

  warn(message: string, ...args: unknown[]) {
    if (isDev) console.warn(this.formatMessage('warn', message, ...args));
  }

  error(message: string, ...args: unknown[]) {
    console.error(this.formatMessage('error', message, ...args));
  }

  api(method: string, url: string, data?: unknown) {
    if (isDev) {
      console.group(`API ${method} ${url}`);
      if (data) console.log('Request:', data);
      console.groupEnd();
    }
  }

  apiResponse(method: string, url: string, response: unknown) {
    if (isDev) {
      console.groupCollapsed(`API ${method} ${url}`);
      console.log('Response:', response);
      console.groupEnd();
    }
  }

  apiError(method: string, url: string, error: unknown) {
    console.group(`API ERROR ${method} ${url}`);
    console.error('Error:', error);
    console.groupEnd();
  }
}

export const logger = new Logger();
