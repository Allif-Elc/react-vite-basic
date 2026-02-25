import { memo } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

export const CodeBlock = memo<CodeBlockProps>(({ code, language, title }) => {
  const prismLanguage =
    language === "graphql" ? "graphql" : language === "protobuf" ? "javascript" : "javascript";

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      {title && (
        <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
          {title}
        </div>
      )}
      <Highlight theme={themes.github} code={code.trim()} language={prismLanguage}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} p-4 overflow-x-auto text-sm`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line: line as any })}>
                {(line as any).map((token: any, key: number) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
