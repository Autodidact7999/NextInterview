import { CodeBlock } from "@/components/ui/code-block";
import type { ReferenceAccordionItem } from "@/lib/types";

interface AccordionListProps {
  items: ReferenceAccordionItem[];
}

export function AccordionList({ items }: AccordionListProps) {
  return (
    <div className="accordion-list">
      {items.map((item, index) => (
        <details className="accordion-item" key={`${item.title}-${index}`}>
          <summary className="accordion-trigger">
            <span className="badge reference-tag">{item.tag}</span>
            <span className="accordion-title">{item.title}</span>
            <span aria-hidden className="accordion-chevron">
              ▶
            </span>
          </summary>
          <div className="accordion-panel">
            <div
              className="rich-text"
              dangerouslySetInnerHTML={{ __html: `<p>${item.body}</p>` }}
            />
            <CodeBlock html={item.code} />
            {item.trap ? (
              <div className="notice notice-warning">
                <strong>Trap:</strong> {item.trap}
              </div>
            ) : null}
            {item.edgeCases ? (
              <div className="notice notice-neutral">
                <strong>Edge cases:</strong> {item.edgeCases}
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
