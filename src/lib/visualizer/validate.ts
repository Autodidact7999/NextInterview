import type {
  JsonValue,
  TraceFrame,
  TraceProblemDefinition,
  TraceRun,
  TraceScene,
  TraceTreeScene,
  TraceTrieScene,
} from "@/lib/visualizer/types";

export const TRACE_FRAME_LIMIT = 500;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertJsonSafe(
  value: unknown,
  path = "value",
  seen = new Set<object>(),
): void {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return;
  if (typeof value === "number") {
    assert(Number.isFinite(value), `${path} must contain only finite numbers.`);
    return;
  }
  assert(typeof value === "object", `${path} is not JSON-safe.`);
  assert(!seen.has(value), `${path} contains a circular reference.`);
  const object = value as object;
  seen.add(object);
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertJsonSafe(item, `${path}[${index}]`, seen),
    );
  } else {
    assert(
      Object.getPrototypeOf(value) === Object.prototype,
      `${path} contains a class instance.`,
    );
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) =>
      assertJsonSafe(item, `${path}.${key}`, seen),
    );
  }
  seen.delete(object);
}

function unique(values: readonly string[], label: string): void {
  assert(new Set(values).size === values.length, `${label} must be unique.`);
}

function validateTreeScene(
  scene: TraceTreeScene | TraceTrieScene,
  frameId: string,
): void {
  const ids = scene.nodes.map((node) => node.id);
  unique(ids, `${frameId}/${scene.id} node IDs`);
  const known = new Set(ids);
  assert(
    (scene.nodes.length === 0) === (scene.rootId === null),
    `${frameId}/${scene.id} root must match its node set.`,
  );
  if (scene.rootId === null) return;
  assert(
    known.has(scene.rootId),
    `${frameId}/${scene.id} has an unknown root.`,
  );
  assert(
    scene.nodes.filter((node) => node.parentId === null).length === 1 &&
      scene.nodes.find((node) => node.parentId === null)?.id === scene.rootId,
    `${frameId}/${scene.id} must have one declared root.`,
  );
  const children = new Map<string, string[]>();
  for (const node of scene.nodes) {
    if (node.parentId !== null) {
      assert(
        known.has(node.parentId),
        `${frameId}/${scene.id} has an unknown parent.`,
      );
      assert(
        node.parentId !== node.id,
        `${frameId}/${scene.id} contains a self-parent.`,
      );
      children.set(node.parentId, [
        ...(children.get(node.parentId) ?? []),
        node.id,
      ]);
    }
  }
  const visited = new Set<string>();
  const visit = (id: string) => {
    assert(!visited.has(id), `${frameId}/${scene.id} contains a cycle.`);
    visited.add(id);
    for (const child of children.get(id) ?? []) visit(child);
  };
  visit(scene.rootId);
  assert(
    visited.size === scene.nodes.length,
    `${frameId}/${scene.id} contains unreachable nodes.`,
  );
}

function validateScene(scene: TraceScene, frameId: string): void {
  if (scene.kind === "sequence") {
    unique(
      scene.items.map((item) => item.id),
      `${frameId}/${scene.id} item IDs`,
    );
    for (const pointer of scene.pointers ?? []) {
      assert(
        pointer.index >= 0 && pointer.index < scene.items.length,
        `${frameId}/${scene.id} pointer ${pointer.id} is out of range.`,
      );
    }
    unique(
      (scene.ranges ?? []).map((range) => range.id),
      `${frameId}/${scene.id} range IDs`,
    );
    for (const range of scene.ranges ?? []) {
      assert(
        range.start >= 0 &&
          range.end < scene.items.length &&
          range.start <= range.end,
        `${frameId}/${scene.id} range ${range.id} is invalid.`,
      );
    }
  } else if (scene.kind === "associative") {
    unique(
      scene.entries.map((entry) => entry.id),
      `${frameId}/${scene.id} item IDs`,
    );
  } else if (scene.kind === "stack") {
    unique(
      scene.items.map((item) => item.id),
      `${frameId}/${scene.id} item IDs`,
    );
  } else if (scene.kind === "linked-list") {
    const ids = scene.nodes.map((node) => node.id);
    unique(ids, `${frameId}/${scene.id} node IDs`);
    const known = new Set(ids);
    if (scene.headId !== null)
      assert(
        known.has(scene.headId),
        `${frameId}/${scene.id} has an unknown head.`,
      );
    for (const node of scene.nodes) {
      if (node.nextId !== null)
        assert(
          known.has(node.nextId),
          `${frameId}/${scene.id} has an unknown next node.`,
        );
    }
    for (const pointer of scene.pointers ?? []) {
      if (pointer.nodeId !== null)
        assert(
          known.has(pointer.nodeId),
          `${frameId}/${scene.id} has an unknown pointer.`,
        );
    }
    if (scene.cycleToId != null)
      assert(
        known.has(scene.cycleToId),
        `${frameId}/${scene.id} has an unknown cycle target.`,
      );
  } else if (scene.kind === "tree") {
    validateTreeScene(scene, frameId);
  } else if (scene.kind === "trie") {
    validateTreeScene(scene, frameId);
  } else {
    unique(
      scene.bars.map((bar) => bar.id),
      `${frameId}/${scene.id} bar IDs`,
    );
    if (scene.range) {
      assert(
        scene.range.start >= 0 &&
          scene.range.end < scene.bars.length &&
          scene.range.start <= scene.range.end,
        `${frameId}/${scene.id} range is invalid.`,
      );
    }
    for (const marker of scene.markers ?? []) {
      assert(
        marker.index >= 0 && marker.index < scene.bars.length,
        `${frameId}/${scene.id} marker is out of range.`,
      );
    }
  }
}

function validateFrame(
  frame: TraceFrame,
  anchorIds: ReadonlySet<string>,
): void {
  assert(frame.explanation.trim(), `${frame.id} needs an explanation.`);
  assert(frame.changed.trim(), `${frame.id} needs a changed-state summary.`);
  assert(frame.invariant.trim(), `${frame.id} needs an invariant.`);
  assert(frame.scenes.length > 0, `${frame.id} needs at least one scene.`);
  for (const codeRef of frame.codeRefs)
    assert(
      anchorIds.has(codeRef),
      `${frame.id} references unknown anchor ${codeRef}.`,
    );
  unique(
    frame.scenes.map((scene) => scene.id),
    `${frame.id} scene IDs`,
  );
  if (frame.focusSceneId)
    assert(
      frame.scenes.some((scene) => scene.id === frame.focusSceneId),
      `${frame.id} focuses unknown scene ${frame.focusSceneId}.`,
    );
  frame.scenes.forEach((scene) => validateScene(scene, frame.id));
  if (frame.checkpoint) {
    assert(
      frame.checkpoint.options.length >= 2,
      `${frame.id} checkpoint needs choices.`,
    );
    unique(
      frame.checkpoint.options.map((option) => option.id),
      `${frame.id} checkpoint option IDs`,
    );
    assert(
      frame.checkpoint.options.some(
        (option) => option.id === frame.checkpoint?.answerId,
      ),
      `${frame.id} checkpoint answer is missing.`,
    );
    assert(
      frame.checkpoint.explanation.trim(),
      `${frame.id} checkpoint needs an explanation.`,
    );
  }
}

export function validateTraceRun(
  definition: TraceProblemDefinition,
  run: TraceRun,
): TraceRun {
  assert(run.frames.length > 0, `LC ${definition.lc} produced no frames.`);
  assert(
    run.frames.length <= TRACE_FRAME_LIMIT,
    `LC ${definition.lc} exceeded ${TRACE_FRAME_LIMIT} frames.`,
  );
  unique(
    run.frames.map((frame) => frame.id),
    `LC ${definition.lc} frame IDs`,
  );
  const anchorIds = new Set(definition.anchors.map((anchor) => anchor.id));
  run.frames.forEach((frame) => validateFrame(frame, anchorIds));
  const completed = run.frames.filter((frame) => frame.complete);
  assert(
    completed.length === 1,
    `LC ${definition.lc} needs exactly one complete frame.`,
  );
  assert(
    run.frames.at(-1)?.complete,
    `LC ${definition.lc} complete frame must be last.`,
  );
  assert(
    JSON.stringify(run.frames.at(-1)?.output) === JSON.stringify(run.output),
    `LC ${definition.lc} final frame output must match the run.`,
  );
  assertJsonSafe(run as unknown as JsonValue, `LC ${definition.lc} run`);
  return run;
}

export function validateTraceDefinition(
  definition: TraceProblemDefinition,
): void {
  assert(definition.lc > 0, "LC ID must be positive.");
  assert(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(definition.slug),
    `LC ${definition.lc} has an invalid slug.`,
  );
  assert(
    definition.fields.length > 0,
    `LC ${definition.lc} needs input fields.`,
  );
  assert(
    definition.presets.length >= 2,
    `LC ${definition.lc} needs at least two presets.`,
  );
  unique(
    definition.fields.map((field) => field.id),
    `LC ${definition.lc} field IDs`,
  );
  unique(
    definition.presets.map((preset) => preset.id),
    `LC ${definition.lc} preset IDs`,
  );
  unique(
    definition.anchors.map((anchor) => anchor.id),
    `LC ${definition.lc} anchor IDs`,
  );
  const fieldIds = new Set(definition.fields.map((field) => field.id));
  for (const preset of definition.presets) {
    assert(
      Object.keys(preset.values).every((field) => fieldIds.has(field)),
      `LC ${definition.lc} preset ${preset.id} has an unknown field.`,
    );
    assert(
      definition.fields.every((field) => field.id in preset.values),
      `LC ${definition.lc} preset ${preset.id} is incomplete.`,
    );
  }
}
