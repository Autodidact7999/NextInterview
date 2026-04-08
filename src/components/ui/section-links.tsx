import Link from "next/link";

export interface SectionLinkOption<TValue extends string> {
  label: string;
  value: TValue;
}

interface SectionLinksProps<TValue extends string> {
  basePath: string;
  paramName: string;
  options: readonly SectionLinkOption<TValue>[];
  activeValue: TValue;
}

export function SectionLinks<TValue extends string>({
  basePath,
  paramName,
  options,
  activeValue,
}: SectionLinksProps<TValue>) {
  return (
    <div
      className="chip-row"
      role="tablist"
      aria-label={`${paramName} navigation`}
    >
      {options.map((option) => {
        const href =
          option.value === "all"
            ? basePath
            : `${basePath}?${paramName}=${option.value}`;
        const isActive = option.value === activeValue;

        return (
          <Link
            key={option.value}
            className={`chip-link ${isActive ? "chip-link-active" : ""}`}
            href={href}
            role="tab"
            aria-selected={isActive}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
