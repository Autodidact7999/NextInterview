"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "@/components/trace/trace-scene.module.css";
import type {
  JsonValue,
  TraceBarRangeScene,
  TraceItemRole,
  TraceScene,
  TraceTreeNode,
  TraceTreeScene,
  TraceTrieScene,
} from "@/lib/visualizer/types";

const roleLabels: Record<TraceItemRole, string> = {
  default: "unchanged",
  current: "current",
  candidate: "candidate",
  accepted: "accepted",
  rejected: "rejected",
  visited: "visited",
  dimmed: "outside the active state",
};

function roleClass(role: TraceItemRole | undefined) {
  return role ? styles[`role${role[0].toUpperCase()}${role.slice(1)}`] : "";
}

function roleText(role: TraceItemRole | undefined) {
  return roleLabels[role ?? "default"];
}

function formatValue(value: JsonValue): string {
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object") return String(value);
  return JSON.stringify(value);
}

function SceneHeader({ scene }: { scene: TraceScene }) {
  return (
    <header className={styles.header}>
      <h3>{scene.title}</h3>
      <p>{scene.description}</p>
    </header>
  );
}

function SequenceScene({
  scene,
}: {
  scene: Extract<TraceScene, { kind: "sequence" }>;
}) {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.getClientRects().length === 0) return;
    const current = viewport?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (viewport && current && typeof viewport.scrollTo === "function") {
      viewport.scrollTo({
        behavior: reducedMotion ? "auto" : "smooth",
        left: Math.max(
          0,
          current.offsetLeft - (viewport.clientWidth - current.clientWidth) / 2,
        ),
      });
    }
  }, [reducedMotion, scene]);

  return (
    <>
      {scene.ranges?.length ? (
        <div className={styles.rangeSummary}>
          {scene.ranges.map((range) => (
            <span className={roleClass(range.role)} key={range.id}>
              {range.label}: {range.start}–{range.end}
            </span>
          ))}
        </div>
      ) : null}
      <div aria-hidden className={styles.sequence} ref={viewportRef}>
        {scene.items.map((item, index) => {
          const pointers =
            scene.pointers?.filter((pointer) => pointer.index === index) ?? [];
          const ranges =
            scene.ranges?.filter(
              (range) => index >= range.start && index <= range.end,
            ) ?? [];
          const active =
            item.role === "current" ||
            item.role === "candidate" ||
            pointers.length > 0;
          return (
            <div
              className={styles.sequenceSlot}
              data-active={active}
              data-in-range={ranges.length > 0}
              key={item.id}
            >
              <span className={styles.pointers}>
                {pointers.map((pointer) => (
                  <span key={pointer.id}>{pointer.label}</span>
                ))}
              </span>
              <span className={`${styles.cell} ${roleClass(item.role)}`}>
                <span className={styles.value}>{String(item.value)}</span>
              </span>
              <span className={styles.index}>{item.label}</span>
              {item.note ? (
                <span className={styles.note}>{item.note}</span>
              ) : null}
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{scene.title}</caption>
        <thead>
          <tr>
            <th>Position</th>
            <th>Value</th>
            <th>State</th>
            <th>Pointers</th>
            <th>Ranges</th>
          </tr>
        </thead>
        <tbody>
          {scene.items.map((item, index) => (
            <tr key={item.id}>
              <th>{item.label}</th>
              <td>{String(item.value)}</td>
              <td>{roleText(item.role)}</td>
              <td>
                {(scene.pointers ?? [])
                  .filter((pointer) => pointer.index === index)
                  .map((pointer) => pointer.label)
                  .join(", ") || "none"}
              </td>
              <td>
                {(scene.ranges ?? [])
                  .filter((range) => index >= range.start && index <= range.end)
                  .map((range) => range.label)
                  .join(", ") || "none"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AssociativeScene({
  scene,
}: {
  scene: Extract<TraceScene, { kind: "associative" }>;
}) {
  return scene.entries.length ? (
    <dl className={styles.mapGrid}>
      {scene.entries.map((entry) => (
        <div
          className={`${styles.mapEntry} ${roleClass(entry.role)}`}
          key={entry.id}
        >
          <dt>{entry.key}</dt>
          <dd>
            {Array.isArray(entry.value) ? (
              <span className={styles.valueList}>
                {entry.value.map((value, index) => (
                  <span key={`${entry.id}-${index}`}>{formatValue(value)}</span>
                ))}
              </span>
            ) : (
              formatValue(entry.value)
            )}
            <span className="sr-only">, {roleText(entry.role)}</span>
          </dd>
        </div>
      ))}
    </dl>
  ) : (
    <p className={styles.empty}>{scene.emptyLabel ?? "No entries yet."}</p>
  );
}

function StackScene({
  scene,
}: {
  scene: Extract<TraceScene, { kind: "stack" }>;
}) {
  if (!scene.items.length)
    return <p className={styles.empty}>The stack is empty.</p>;
  return (
    <div className={styles.stackWrap}>
      <span aria-hidden className={styles.stackLabel}>
        {scene.topLabel ?? "top"} ↓
      </span>
      <ol className={styles.stack}>
        {[...scene.items].reverse().map((item, index) => (
          <li
            className={`${styles.stackItem} ${roleClass(item.role)}`}
            key={item.id}
          >
            <span>{String(item.value)}</span>
            <small>
              {index === 0 ? "top" : item.label}
              {item.note ? ` · ${item.note}` : ""}
              <span className="sr-only"> · {roleText(item.role)}</span>
            </small>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LinkedListScene({
  scene,
}: {
  scene: Extract<TraceScene, { kind: "linked-list" }>;
}) {
  const width = Math.max(340, scene.nodes.length * 112 + 72);
  const y = 92;
  const xById = new Map(
    scene.nodes.map((node, index) => [node.id, 58 + index * 112]),
  );
  const pointerLabels = new Map<string, string[]>();
  const nullPointers: string[] = [];
  for (const pointer of scene.pointers ?? []) {
    if (pointer.nodeId === null) nullPointers.push(pointer.label);
    else
      pointerLabels.set(pointer.nodeId, [
        ...(pointerLabels.get(pointer.nodeId) ?? []),
        pointer.label,
      ]);
  }
  const markerId = `arrow-${scene.id.replace(/[^a-z0-9]/gi, "-")}`;

  if (!scene.nodes.length)
    return (
      <p className={styles.empty}>
        The list is empty
        {nullPointers.length
          ? `; ${nullPointers.join(", ")} point to null`
          : ""}
        .
      </p>
    );

  return (
    <div className={styles.linkedWrap}>
      <div aria-hidden className={styles.graphViewport}>
        <svg
          className={styles.linkedGraph}
          height="190"
          role="presentation"
          viewBox={`0 0 ${width} 190`}
          width={width}
        >
          <defs>
            <marker
              id={markerId}
              markerHeight="8"
              markerWidth="8"
              orient="auto"
              refX="7"
              refY="4"
            >
              <path className={styles.arrowHead} d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>
          {scene.nodes.map((node, index) => {
            const fromX = xById.get(node.id) ?? 0;
            if (node.nextId === null)
              return (
                <g key={`edge-${node.id}`}>
                  <line
                    className={styles.linkEdge}
                    markerEnd={`url(#${markerId})`}
                    x1={fromX}
                    x2={fromX}
                    y1={y + 29}
                    y2={151}
                  />
                  <text className={styles.nullLabel} x={fromX} y="174">
                    null
                  </text>
                </g>
              );
            const targetX = xById.get(node.nextId);
            if (targetX === undefined) return null;
            const direction = targetX > fromX ? 1 : -1;
            const startX = fromX + direction * 29;
            const endX = targetX - direction * 34;
            const distant = Math.abs(targetX - fromX) > 120;
            const d = distant
              ? `M ${startX} ${y} Q ${(startX + endX) / 2} 20 ${endX} ${y}`
              : `M ${startX} ${y} L ${endX} ${y}`;
            return (
              <path
                className={`${styles.linkEdge} ${scene.cycleToId === node.nextId && index === scene.nodes.length - 1 ? styles.cycleEdge : ""}`}
                d={d}
                key={`edge-${node.id}`}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
          {scene.nodes.map((node) => {
            const x = xById.get(node.id) ?? 0;
            const pointers = pointerLabels.get(node.id) ?? [];
            return (
              <g
                className={`${styles.linkNodeGroup} ${roleClass(node.role)}`}
                key={node.id}
              >
                {scene.headId === node.id ? (
                  <text className={styles.headLabel} x={x} y="20">
                    head
                  </text>
                ) : null}
                {pointers.length ? (
                  <text className={styles.pointerLabel} x={x} y="43">
                    {pointers.join(" · ")}
                  </text>
                ) : null}
                <circle cx={x} cy={y} r="28" />
                <text className={styles.nodeValue} x={x} y={y + 5}>
                  {String(node.value)}
                </text>
                {node.label ? (
                  <text className={styles.nodeMeta} x={x} y="134">
                    {node.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      {nullPointers.length ? (
        <p aria-hidden className={styles.nullPointers}>
          {nullPointers.join(" · ")} → null
        </p>
      ) : null}
      <div className="sr-only">
        <p>
          {scene.headId === null
            ? "Head is null."
            : `Head points to ${scene.headId}.`}
        </p>
        <ul>
          {scene.nodes.map((node) => (
            <li key={node.id}>
              {node.id}, value {String(node.value)}, {roleText(node.role)},
              points to {node.nextId ?? "null"}
              {node.label ? `, labeled ${node.label}` : ""}.
            </li>
          ))}
        </ul>
        <ul>
          {(scene.pointers ?? []).map((pointer) => (
            <li key={pointer.id}>
              {pointer.label} points to {pointer.nodeId ?? "null"}.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface PositionedTreeNode {
  node: TraceTreeNode;
  x: number;
  y: number;
}

function positionTree(scene: TraceTreeScene | TraceTrieScene) {
  const children = new Map<string, TraceTreeNode[]>();
  const byId = new Map(scene.nodes.map((node) => [node.id, node]));
  for (const node of scene.nodes) {
    if (node.parentId !== null)
      children.set(node.parentId, [
        ...(children.get(node.parentId) ?? []),
        node,
      ]);
  }
  let leafIndex = 0;
  let maxDepth = 0;
  const positions = new Map<string, PositionedTreeNode>();
  const place = (id: string, depth: number): number => {
    const node = byId.get(id);
    if (!node) return 0;
    maxDepth = Math.max(maxDepth, depth);
    const descendants = children.get(id) ?? [];
    const childXs = descendants.map((child) => place(child.id, depth + 1));
    const x = childXs.length
      ? childXs.reduce((sum, value) => sum + value, 0) / childXs.length
      : 90 + leafIndex++ * 118;
    positions.set(id, { node, x, y: 50 + depth * 88 });
    return x;
  };
  if (scene.rootId) place(scene.rootId, 0);
  return {
    height: Math.max(160, 100 + maxDepth * 88),
    positions,
    width: Math.max(300, 90 + Math.max(1, leafIndex) * 118),
  };
}

function TreeScene({ scene }: { scene: TraceTreeScene | TraceTrieScene }) {
  if (!scene.nodes.length)
    return <p className={styles.empty}>The tree is empty.</p>;
  const { height, positions, width } = positionTree(scene);
  return (
    <div className={styles.tree}>
      <div aria-hidden className={styles.graphViewport}>
        <svg
          className={styles.treeGraph}
          height={height}
          role="presentation"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          {scene.nodes.map((node) => {
            if (node.parentId === null) return null;
            const parent = positions.get(node.parentId);
            const child = positions.get(node.id);
            if (!parent || !child) return null;
            return (
              <g key={`edge-${node.id}`}>
                <line
                  className={`${styles.treeEdge} ${roleClass(node.role)}`}
                  x1={parent.x}
                  x2={child.x}
                  y1={parent.y + 25}
                  y2={child.y - 25}
                />
                {node.edgeLabel ? (
                  <text
                    className={styles.edgeLabel}
                    x={(parent.x + child.x) / 2}
                    y={(parent.y + child.y) / 2 - 5}
                  >
                    {node.edgeLabel}
                  </text>
                ) : null}
              </g>
            );
          })}
          {scene.nodes.map((node) => {
            const position = positions.get(node.id);
            if (!position) return null;
            return (
              <g
                className={`${styles.treeNodeGroup} ${roleClass(node.role)}`}
                key={node.id}
                transform={`translate(${position.x} ${position.y})`}
              >
                {node.note ? <title>{node.note}</title> : null}
                <circle r="25" />
                <text className={styles.nodeValue} y="5">
                  {String(node.value)}
                </text>
                {node.badge !== undefined ? (
                  <text className={styles.nodeBadge} y="40">
                    {String(node.badge)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <ul className="sr-only">
        {scene.nodes.map((node) => (
          <li key={node.id}>
            {node.id}, value {String(node.value)}, {roleText(node.role)},
            {node.parentId ? ` child of ${node.parentId}` : " root"}
            {node.edgeLabel ? ` by edge ${node.edgeLabel}` : ""}
            {node.badge !== undefined ? `, badge ${String(node.badge)}` : ""}
            {node.note ? `, ${node.note}` : ""}.
          </li>
        ))}
      </ul>
    </div>
  );
}

function markerLabels(scene: TraceBarRangeScene) {
  const labels = new Map<number, string[]>();
  for (const marker of scene.markers ?? []) {
    labels.set(marker.index, [
      ...(labels.get(marker.index) ?? []),
      marker.label,
    ]);
  }
  return labels;
}

function OrderedRangeScene({ scene }: { scene: TraceBarRangeScene }) {
  const labels = markerLabels(scene);
  return (
    <div aria-hidden className={styles.orderedRange}>
      {scene.bars.map((bar, index) => {
        const inRange =
          scene.range && index >= scene.range.start && index <= scene.range.end;
        return (
          <div
            className={`${styles.orderedSlot} ${roleClass(bar.role)}`}
            data-in-range={Boolean(inRange)}
            key={bar.id}
          >
            <span className={styles.pointers}>
              {(labels.get(index) ?? []).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </span>
            <strong>{bar.value}</strong>
            <small>{bar.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function BarRangeScene({ scene }: { scene: TraceBarRangeScene }) {
  const presentation = scene.presentation ?? "magnitude";
  const max = Math.max(1, ...scene.bars.map((bar) => Math.abs(bar.value)));
  const labels = markerLabels(scene);
  const containerHeight = scene.range
    ? Math.min(
        scene.bars[scene.range.start]?.value ?? 0,
        scene.bars[scene.range.end]?.value ?? 0,
      )
    : 0;

  return (
    <div>
      {scene.range ? (
        <p className={styles.rangeLabel}>
          <span>Active range</span>
          <strong>{scene.range.label}</strong>
          <small>
            {scene.range.start}–{scene.range.end}
          </small>
        </p>
      ) : null}
      {presentation === "ordered" ? (
        <OrderedRangeScene scene={scene} />
      ) : (
        <div
          aria-hidden
          className={`${styles.bars} ${styles[`bars${presentation[0].toUpperCase()}${presentation.slice(1)}`]}`}
        >
          {presentation === "signed" ? (
            <span className={styles.zeroBaseline} />
          ) : null}
          {presentation === "container" && scene.range ? (
            <span
              className={styles.containerArea}
              style={
                {
                  "--area-left": `${((scene.range.start + 0.5) / scene.bars.length) * 100}%`,
                  "--area-width": `${((scene.range.end - scene.range.start) / scene.bars.length) * 100}%`,
                  "--area-height": `${(containerHeight / max) * 100}%`,
                } as React.CSSProperties
              }
            />
          ) : null}
          {scene.bars.map((bar, index) => {
            const signed = presentation === "signed";
            const height = Math.max(4, (Math.abs(bar.value) / max) * 100);
            const inRange =
              scene.range &&
              index >= scene.range.start &&
              index <= scene.range.end;
            return (
              <div
                className={`${styles.barSlot} ${roleClass(bar.role)}`}
                data-in-range={Boolean(inRange)}
                key={bar.id}
              >
                <span className={styles.pointers}>
                  {(labels.get(index) ?? []).map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </span>
                <span className={styles.barTrack}>
                  <span
                    className={`${styles.barFill} ${signed && bar.value < 0 ? styles.negativeBar : ""}`}
                    style={
                      { "--bar-height": `${height}%` } as React.CSSProperties
                    }
                  />
                </span>
                <span className={styles.barValue}>{bar.value}</span>
                <span className={styles.index}>{bar.label}</span>
              </div>
            );
          })}
        </div>
      )}
      <table className="sr-only">
        <caption>{scene.title}</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
            <th>State</th>
            <th>Markers</th>
            <th>Range</th>
          </tr>
        </thead>
        <tbody>
          {scene.bars.map((bar, index) => (
            <tr key={bar.id}>
              <th>{bar.label}</th>
              <td>{bar.value}</td>
              <td>{roleText(bar.role)}</td>
              <td>{(labels.get(index) ?? []).join(", ") || "none"}</td>
              <td>
                {scene.range &&
                index >= scene.range.start &&
                index <= scene.range.end
                  ? scene.range.label
                  : "outside"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function defaultFocus(scenes: readonly TraceScene[], requested?: string) {
  if (requested && scenes.some((scene) => scene.id === requested))
    return requested;
  if (scenes.length < 3) return scenes[0]?.id ?? "";
  const structural = scenes.find((scene) =>
    ["bar-range", "tree", "trie"].includes(scene.kind),
  );
  if (structural) return structural.id;
  if (scenes.every((scene) => scene.kind === "linked-list"))
    return scenes.at(-1)?.id ?? scenes[0]?.id ?? "";
  return scenes[0]?.id ?? "";
}

export function TraceSceneDeck({
  focusSceneId,
  scenes,
}: {
  focusSceneId?: string;
  scenes: readonly TraceScene[];
}) {
  const recommended = useMemo(
    () => defaultFocus(scenes, focusSceneId),
    [focusSceneId, scenes],
  );
  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const selected =
    manualSelection && scenes.some((scene) => scene.id === manualSelection)
      ? manualSelection
      : recommended;

  return (
    <div className={styles.deckShell}>
      {scenes.length > 1 ? (
        <div
          aria-label="Choose visible state"
          className={`${styles.sceneChooser} ${scenes.length === 2 ? styles.twoSceneChooser : ""}`}
          role="group"
        >
          {scenes.map((scene) => (
            <button
              aria-pressed={selected === scene.id}
              key={scene.id}
              onClick={() => setManualSelection(scene.id)}
              type="button"
            >
              {scene.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.deck} data-count={scenes.length}>
        {scenes.map((scene) => (
          <div
            className={styles.sceneWrap}
            data-focus={selected === scene.id}
            data-kind={scene.kind}
            data-selected={selected === scene.id}
            key={scene.id}
          >
            <TraceSceneView scene={scene} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TraceSceneView({ scene }: { scene: TraceScene }) {
  const reducedMotion = useReducedMotion();
  let body: React.ReactNode;
  switch (scene.kind) {
    case "sequence":
      body = <SequenceScene scene={scene} />;
      break;
    case "associative":
      body = <AssociativeScene scene={scene} />;
      break;
    case "stack":
      body = <StackScene scene={scene} />;
      break;
    case "linked-list":
      body = <LinkedListScene scene={scene} />;
      break;
    case "tree":
    case "trie":
      body = <TreeScene scene={scene} />;
      break;
    case "bar-range":
      body = <BarRangeScene scene={scene} />;
      break;
  }
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.scene} ${reducedMotion ? styles.reduced : ""}`}
      initial={reducedMotion ? false : { opacity: 0.75, y: 3 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
    >
      <SceneHeader scene={scene} />
      {body}
    </motion.section>
  );
}
