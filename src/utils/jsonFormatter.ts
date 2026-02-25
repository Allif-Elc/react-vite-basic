import prettier from "prettier";

export interface FormatResult {
  formatted: string;
  error: string | null;
}

export async function formatJSON(jsonString: string): Promise<FormatResult> {
  if (!jsonString.trim()) {
    return { formatted: "", error: null };
  }

  try {
    const formatted = await prettier.format(jsonString, {
      parser: "json",
      trailingComma: "es5",
      tabWidth: 2,
      useTabs: false,
      semi: true,
    });
    return { formatted: formatted.trim(), error: null };
  } catch (error) {
    return {
      formatted: jsonString,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}
