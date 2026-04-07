"use client";

import { AccordionList } from "@/components/ui/accordion-list";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionLinks } from "@/components/ui/section-links";
import { MindMap } from "@/components/reference/mind-map";
import {
  collectionsReferenceEntries,
  patternReferenceEntries,
  quickRefRows,
  quizEntries,
  referenceNotices,
  referencePills,
  syntaxBlocks,
  trapEntries,
  typesReferenceEntries,
} from "@/content/reference";
import { referenceSectionOptions } from "@/lib/routes/search-params";
import type { ReferenceSection } from "@/lib/types";

export function ReferenceView({
  selectedSection,
}: {
  selectedSection: ReferenceSection;
}) {
  return (
    <div className="app-page page-stack">
      <section className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">Reference</p>
          <h1 className="page-title">
            Keep the Java and DSA essentials within reach.
          </h1>
          <p className="page-description">
            Use this space for quick refreshers before practice, interviews, and
            revision sessions when you need the right structure fast.
          </p>
        </div>
      </section>

      <SectionLinks
        activeValue={selectedSection}
        basePath="/reference"
        options={referenceSectionOptions}
        paramName="section"
      />

      {selectedSection === "mindmap" ? (
        <section className="surface surface-inner page-stack">
          <div>
            <p className="eyebrow">Mind map</p>
            <h2 className="section-title">
              Explore the Java building blocks visually
            </h2>
            <p className="section-copy">
              Explore the concepts visually and jump between structures when you
              want a fast mental reset.
            </p>
          </div>
          <MindMap />
        </section>
      ) : null}

      {selectedSection === "quick-ref" ? (
        <>
          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Quick reference</p>
              <h2 className="section-title">What to use when</h2>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Need</th>
                    <th>Best Java tool</th>
                    <th>Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {quickRefRows.map((row) => (
                    <tr key={row.need}>
                      <td className="mono">{row.need}</td>
                      <td>{row.tool}</td>
                      <td>{row.complexity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Minimal syntax sheet</p>
              <h2 className="section-title">
                The pieces interviewers expect you to write cold
              </h2>
            </div>

            <div className="feature-grid two-up">
              {syntaxBlocks.map((block) => (
                <article className="feature-card" key={block.title}>
                  <h3>{block.title}</h3>
                  <CodeBlock code={block.code} />
                </article>
              ))}
            </div>

            <div className="pill-list">
              {referencePills.map((pill) => (
                <span className="pill" key={pill}>
                  {pill}
                </span>
              ))}
            </div>

            <div className="notice">
              <strong>Golden rule:</strong> understand the problem, choose the
              right structure, write from memory, and then handle the edge cases
              calmly.
            </div>
          </section>
        </>
      ) : null}

      {selectedSection === "types" ? (
        <section className="surface surface-inner page-stack">
          <div>
            <p className="eyebrow">Types & Strings</p>
            <h2 className="section-title">
              Primitives, arrays, strings, wrappers, and mutation choices
            </h2>
          </div>
          <AccordionList items={typesReferenceEntries} />
        </section>
      ) : null}

      {selectedSection === "collections" ? (
        <section className="surface surface-inner page-stack">
          <div>
            <p className="eyebrow">Collections</p>
            <h2 className="section-title">
              The structures that carry most interview solutions
            </h2>
          </div>
          <AccordionList items={collectionsReferenceEntries} />
        </section>
      ) : null}

      {selectedSection === "patterns" ? (
        <section className="surface surface-inner page-stack">
          <div>
            <p className="eyebrow">Patterns</p>
            <h2 className="section-title">
              Reusable templates with the traps called out
            </h2>
          </div>
          <AccordionList items={patternReferenceEntries} />
        </section>
      ) : null}

      {selectedSection === "traps" ? (
        <>
          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Common mistakes</p>
              <h2 className="section-title">
                The Java traps worth memorising once
              </h2>
            </div>

            <div className="card-list">
              {trapEntries.map((trap, index) => (
                <article className="feature-card" key={trap.title}>
                  <span className="badge accent-coral">{index + 1}</span>
                  <h3>{trap.title}</h3>
                  <p>{trap.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Special notices</p>
              <h2 className="section-title">
                These are the silent bugs that cost people rounds
              </h2>
            </div>

            {referenceNotices.map((notice) => (
              <div className="notice" key={notice.title}>
                <strong>{notice.title}:</strong> {notice.body}
              </div>
            ))}
          </section>

          <section className="surface surface-inner page-stack">
            <div>
              <p className="eyebrow">Quick quiz</p>
              <h2 className="section-title">
                Fast checks you should answer without hesitation
              </h2>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {quizEntries.map((entry) => (
                    <tr key={entry.question}>
                      <td>{entry.question}</td>
                      <td>{entry.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
