type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "session",
];

const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  jwt: /eyJ[a-zA-Z0-9+/=_-]+\.[a-zA-Z0-9+/=_-]+\.[a-zA-Z0-9+/=_-]+/g,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
};

const MAX_DEPTH = 3;
const MAX_ARRAY_LENGTH = 10;
const MAX_STRING_LENGTH = 100;

class Logger {
  private sanitize(obj: unknown, depth = 0, visited = new WeakSet()): unknown {
    if (depth > MAX_DEPTH) return "[Max depth reached]";

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {
      let str = obj;
      if (str.length > MAX_STRING_LENGTH) {
        str = str.substring(0, MAX_STRING_LENGTH) + "...";
      }
      return str;
    }

    if (typeof obj !== "object") return obj;

    if (visited.has(obj as object)) return "[Circular]";
    visited.add(obj as object);

    if (Array.isArray(obj)) {
      if (obj.length > MAX_ARRAY_LENGTH) {
        const sliced = obj.slice(0, MAX_ARRAY_LENGTH);
        const sanitized = sliced.map((item) => this.sanitize(item, depth + 1, visited));
        return [...sanitized, `... ${obj.length - MAX_ARRAY_LENGTH} more`];
      }
      return obj.map((item) => this.sanitize(item, depth + 1, visited));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = this.sanitize(value, depth + 1, visited);
      }
    }
    return result;
  }

  private redactPII(message: string, args: unknown[]): { message: string; args: unknown[] } {
    if (isDev) return { message, args };

    let redactedMessage = message;
    redactedMessage = redactedMessage.replace(PII_PATTERNS.email, (match) => {
      const [local, domain] = match.split("@");
      const localRedacted = local[0] + "***";
      const [domainName, ...domainParts] = domain.split(".");
      const domainRedacted = domainName[0] + "***." + domainParts.join(".");
      return `${localRedacted}@${domainRedacted}`;
    });
    redactedMessage = redactedMessage.replace(PII_PATTERNS.jwt, "[REDACTED_JWT]");
    redactedMessage = redactedMessage.replace(PII_PATTERNS.uuid, "[REDACTED_UUID]");

    const sanitizedArgs = args.map((arg) => this.sanitize(arg));
    return { message: redactedMessage, args: sanitizedArgs };
  }

  private formatMessage(level: LogLevel, message: string, args: unknown[]): string {
    const { message: redactedMessage, args: sanitizedArgs } = this.redactPII(message, args);
    const timestamp = new Date().toISOString();
    const argsStr = sanitizedArgs.length > 0 ? ` ${JSON.stringify(sanitizedArgs)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${redactedMessage}${argsStr}`;
  }

  debug(message: string, ...args: unknown[]) {
    if (isDev) console.debug(this.formatMessage("debug", message, args));
  }

  info(message: string, ...args: unknown[]) {
    if (isDev) console.info(this.formatMessage("info", message, args));
  }

  warn(message: string, ...args: unknown[]) {
    if (isDev) console.warn(this.formatMessage("warn", message, args));
  }

  error(message: string, ...args: unknown[]) {
    const { message: redactedMessage, args: sanitizedArgs } = this.redactPII(message, args);
    console.error(this.formatMessage("error", redactedMessage, sanitizedArgs));
  }

  api(method: string, url: string, data?: unknown) {
    if (isDev) {
      const { message: redactedUrl, args: [sanitizedData] } = this.redactPII(url, data ? [data] : []);
      console.group(`API ${method} ${redactedUrl}`);
      if (sanitizedData) console.log("Request:", sanitizedData);
      console.groupEnd();
    }
  }

  apiResponse(method: string, url: string, response: unknown) {
    if (isDev) {
      const { message: redactedUrl, args: [sanitizedResponse] } = this.redactPII(url, [response]);
      console.groupCollapsed(`API ${method} ${redactedUrl}`);
      console.log("Response:", sanitizedResponse);
      console.groupEnd();
    }
  }

  apiError(method: string, url: string, error: unknown) {
    const { message: redactedUrl, args: [sanitizedError] } = this.redactPII(url, [error]);
    console.group(`API ERROR ${method} ${redactedUrl}`);
    console.error("Error:", sanitizedError);
    console.groupEnd();
  }
}

export const logger = new Logger();
