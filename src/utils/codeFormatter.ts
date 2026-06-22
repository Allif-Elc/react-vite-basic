export interface FormatResult {
  formatted: string;
  error: string | null;
}

type ContentType = "json" | "graphql" | "xml" | "javascript" | "unknown";

function detectContentType(text: string): ContentType {
  const trimmed = text.trim();
  if (!trimmed) return "unknown";

  // JSON — starts with { or [
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not valid JSON, continue
    }
  }

  // XML — starts with <
  if (/^\s*</.test(trimmed)) {
    return "xml";
  }

  // GraphQL — keywords + braces
  if (
    /\b(query|mutation|subscription|type|schema|interface|enum|input|extend|directive|scalar)\b/.test(
      trimmed
    ) &&
    trimmed.includes("{")
  ) {
    return "graphql";
  }

  // JavaScript — common syntax patterns
  if (
    /\b(function|const|let|var|import|export|class|=>|async|await)\b/.test(
      trimmed
    )
  ) {
    return "javascript";
  }

  return "unknown";
}

// ─── JSON formatter ─────────────────────────────────────

/** Format JSON natively — no prettier needed. */
function formatJSON(jsonString: string): FormatResult {
  const trimmed = jsonString.trim();
  if (!trimmed) return { formatted: "", error: null };
  try {
    const parsed = JSON.parse(trimmed);
    return { formatted: JSON.stringify(parsed, null, 2), error: null };
  } catch (err) {
    return {
      formatted: jsonString,
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
}

// ─── JavaScript / GraphQL formatter ─────────────────────

/**
 * Lightweight brace-based code formatter.
 * Handles JS, TS, GraphQL — anything with curly braces.
 */
function formatBraceCode(code: string): string {
  const lines = code.split("\n");
  const out: string[] = [];
  let depth = 0;
  const indent = "  ";

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Dedent before closing braces
    const openCount = (trimmed.match(/\{/g) || []).length;
    const closeCount = (trimmed.match(/\}/g) || []).length;

    if (closeCount > openCount) {
      depth = Math.max(0, depth - (closeCount - openCount));
    }

    out.push(indent.repeat(depth) + trimmed);

    if (openCount > closeCount) {
      depth += openCount - closeCount;
    }
  }

  return out.join("\n");
}

function formatJavaScript(jsString: string): FormatResult {
  const trimmed = jsString.trim();
  if (!trimmed) return { formatted: "", error: null };
  try {
    return { formatted: formatBraceCode(trimmed), error: null };
  } catch (err) {
    return {
      formatted: jsString,
      error: err instanceof Error ? err.message : "Format error",
    };
  }
}

/** GraphQL uses same brace-based approach for now. */
const formatGraphQL = formatJavaScript;

// ─── XML formatter ──────────────────────────────────────

/** Minimal XML beautifier — indents nested tags. */
function formatXML(xmlString: string): string {
  const trimmed = xmlString.trim();
  if (!trimmed) return "";

  // Strip whitespace between tags so we can re-indent
  const compact = trimmed.replace(/>\s+</g, "><");
  // Tokenise: opening, closing, self-closing, text, CDATA, comments
  const tokens: string[] = [];
  const re =
    /(<!--[\s\S]*?-->)|(<!\[CDATA\[[\s\S]*?\]\]>)|(<[^>]*>)|([^<]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(compact)) !== null) {
    tokens.push(match[0]);
  }

  const lines: string[] = [];
  let depth = 0;
  const indent = "  ";

  for (const token of tokens) {
    const trimmedToken = token.trim();
    if (!trimmedToken) continue;

    // Comment / CDATA — keep as-is at current depth
    if (/^<!--/.test(trimmedToken) || /^<!\[CDATA\[/.test(trimmedToken)) {
      lines.push(indent.repeat(depth) + trimmedToken);
      continue;
    }

    // Self-closing tag (<br/>)
    if (/^<[^/>]*\/\s*>$/.test(trimmedToken)) {
      lines.push(indent.repeat(depth) + trimmedToken);
      continue;
    }

    // Closing tag (</foo>)
    if (/^<\//.test(trimmedToken)) {
      depth = Math.max(0, depth - 1);
      lines.push(indent.repeat(depth) + trimmedToken);
      continue;
    }

    // Opening tag (<foo> or <foo …> or <?xml?> or <!DOCTYPE>)
    if (/^<[^/]/.test(trimmedToken)) {
      lines.push(indent.repeat(depth) + trimmedToken);
      // If it's not a processing instruction or doctype, increase depth
      if (!/^<\?/.test(trimmedToken) && !/^<!/.test(trimmedToken)) {
        depth++;
      }
      continue;
    }

    // Text content — trim and skip empty
    const text = trimmedToken.trim();
    if (text) {
      lines.push(indent.repeat(depth) + text);
    }
  }

  return lines.join("\n");
}

// ─── Main entry point ───────────────────────────────────

/**
 * Auto-detect content type and format the given code string.
 * Uses only native JS — no external dependencies.
 *
 * Supported types: JSON, XML, GraphQL, JavaScript.
 */
export async function formatCode(code: string): Promise<FormatResult> {
  const trimmed = code.trim();
  if (!trimmed) return { formatted: "", error: null };

  const type = detectContentType(trimmed);

  try {
    switch (type) {
      case "json":
        return formatJSON(trimmed);
      case "graphql":
        return formatGraphQL(trimmed);
      case "xml":
        return { formatted: formatXML(trimmed), error: null };
      case "javascript":
        return formatJavaScript(trimmed);
      default: {
        // Unknown — try JSON first, then fallback to brace-formatting
        const jsonResult = formatJSON(trimmed);
        if (!jsonResult.error) return jsonResult;
        return formatJavaScript(trimmed);
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown formatting error";
    return { formatted: code, error: message };
  }
}
