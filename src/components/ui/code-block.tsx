interface CodeBlockProps {
  code?: string;
  html?: string;
  label?: string;
}

export function CodeBlock({ code, html, label = "Java" }: CodeBlockProps) {
  return (
    <div className="code-block-shell">
      <div className="code-block-label">{label}</div>
      <pre className="code-block">
        {html ? (
          <code
            className="code-block-inner"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <code className="code-block-inner">{code}</code>
        )}
      </pre>
    </div>
  );
}
