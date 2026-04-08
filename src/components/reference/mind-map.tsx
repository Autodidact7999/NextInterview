"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/ui/code-block";
import { mindMapEdges, mindMapLegend, mindMapNodes } from "@/content/mindmap";
import { mindMapNodeDetails } from "@/content/reference";

export function MindMap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const detail = selectedNodeId ? mindMapNodeDetails[selectedNodeId] : null;

  return (
    <div className="mindmap-shell">
      <div className="mindmap-panel">
        <svg
          aria-labelledby="mind-map-title"
          className="mindmap-svg"
          role="img"
          viewBox="0 0 900 560"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="mind-map-title">Interactive Java DSA mind map</title>
          {mindMapEdges.map((edge, index) =>
            edge.type === "path" ? (
              <path
                d={edge.path}
                fill="none"
                key={`path-${index}`}
                opacity={edge.opacity}
                stroke={edge.stroke}
                strokeWidth={edge.strokeWidth}
              />
            ) : (
              <line
                key={`line-${index}`}
                opacity={edge.opacity}
                stroke={edge.stroke}
                strokeWidth={edge.strokeWidth}
                x1={edge.x1}
                x2={edge.x2}
                y1={edge.y1}
                y2={edge.y2}
              />
            ),
          )}

          {mindMapNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                aria-label={node.id}
                className={`mindmap-node ${isSelected ? "mindmap-node-selected" : ""}`}
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedNodeId(node.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  fill={node.fill}
                  r={node.r}
                  stroke={node.stroke}
                  strokeWidth={1.5}
                />
                {node.label.map((line, lineIndex) => {
                  const lineHeight = node.label.length === 1 ? 0 : 12;
                  const yOffset =
                    lineIndex * lineHeight -
                    ((node.label.length - 1) * lineHeight) / 2 +
                    4;

                  return (
                    <text
                      fill={node.textColor}
                      fontSize={node.fontSize ?? 10}
                      fontWeight={node.fontWeight ?? 600}
                      key={`${node.id}-${line}`}
                      textAnchor="middle"
                      x={node.cx}
                      y={node.cy + yOffset}
                    >
                      {line}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>

        <div className="mindmap-detail">
          {detail ? (
            <div className="page-stack">
              <div>
                <p className="eyebrow">Selected node</p>
                <h3 className="section-title">{selectedNodeId}</h3>
              </div>
              <p className="section-copy">{detail.desc}</p>
              {detail.whyItWorks ? (
                <p className="section-copy">
                  <strong>Why it works:</strong> {detail.whyItWorks}
                </p>
              ) : null}
              <div className="notice">
                <strong>When:</strong> {detail.when}
              </div>
              <CodeBlock code={detail.example} />
            </div>
          ) : (
            <div className="empty-state">
              Select a node to see when to use it and what the Java shape looks
              like.
            </div>
          )}
        </div>
      </div>

      <div className="mindmap-legend">
        {mindMapLegend.map((item) => (
          <span key={item.label}>
            <span className="mindmap-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
