"use client";

import { useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useReducer,
  useState,
} from "react";

import { TraceSceneDeck } from "@/components/trace/trace-scene";
import styles from "@/components/trace/trace-workspace.module.css";
import { traceRuntimeLoaders } from "@/content/visualizations/loaders.generated";
import { useProgress } from "@/lib/progress/context";
import {
  initialPlaybackState,
  playbackReducer,
  TRACE_SPEEDS,
} from "@/lib/visualizer/playback";
import type {
  PreparedTraceProblem,
  RawTraceInput,
  TraceInputIssue,
  TraceProblemRuntime,
  TraceRun,
  TraceSourceContext,
  TraceVariable,
} from "@/lib/visualizer/types";

type Panel = "visual" | "code";

function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select, button, a") ||
      target.isContentEditable)
  );
}

function VariableValue({ variable }: { variable: TraceVariable }) {
  return (
    <div className={variable.changed ? styles.variableChanged : ""}>
      <dt>{variable.name}</dt>
      <dd>
        {formatValue(variable.value)}
        {variable.changed && variable.previous !== undefined ? (
          <small>was {formatValue(variable.previous)}</small>
        ) : null}
      </dd>
    </div>
  );
}

export function TraceWorkspace({
  problem,
  source: sourceOverride,
}: {
  problem: PreparedTraceProblem;
  source?: TraceSourceContext | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const { setProblemCompletion } = useProgress();
  const initialPreset = problem.presets[0];
  const [raw, setRaw] = useState<RawTraceInput>(initialPreset.values);
  const [selectedPreset, setSelectedPreset] = useState(initialPreset.id);
  const [inputOpen, setInputOpen] = useState(false);
  const [runtime, setRuntime] = useState<TraceProblemRuntime | null>(null);
  const [run, setRun] = useState<TraceRun | null>(null);
  const [issues, setIssues] = useState<readonly TraceInputIssue[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<Panel>("visual");
  const [checkpointAnswers, setCheckpointAnswers] = useState<
    Record<string, string>
  >({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});
  const codeViewportRef = useRef<HTMLPreElement | null>(null);
  const activeCodeLineRef = useRef<HTMLSpanElement | null>(null);
  const [playback, dispatch] = useReducer(
    playbackReducer,
    initialPlaybackState(0),
  );
  const requestedDay = Number(searchParams.get("day"));
  const source =
    sourceOverride === undefined
      ? (problem.days.find(
          (candidate) =>
            Number.isInteger(requestedDay) && candidate.day === requestedDay,
        ) ?? null)
      : sourceOverride;
  const frame = run?.frames[playback.index] ?? null;
  const checkpoint = frame?.checkpoint;
  const answer = checkpoint && frame ? checkpointAnswers[frame.id] : undefined;
  const isRevealed = frame ? revealed[frame.id] : false;

  const applyRuntime = useCallback(
    (loaded: TraceProblemRuntime, values: RawTraceInput) => {
      dispatch({ type: "pause" });
      try {
        const result = loaded.run(values);
        if (!result.ok) {
          setIssues(result.issues);
          setInputOpen(true);
          return false;
        }
        setRun(result.value);
        setIssues([]);
        setLoadError(null);
        setCheckpointAnswers({});
        setRevealed({});
        setInputOpen(false);
        setActivePanel("visual");
        dispatch({ type: "load", frameCount: result.value.frames.length });
        return true;
      } catch {
        setLoadError(
          "The trace could not be generated. Reset to a preset and try again.",
        );
        setInputOpen(true);
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    const loader = traceRuntimeLoaders[problem.slug];
    if (!loader) {
      queueMicrotask(
        () => active && setLoadError("This trace runtime is not available."),
      );
      return () => {
        active = false;
      };
    }
    void loader()
      .then(({ runtime: loaded }) => {
        if (!active) return;
        setRuntime(loaded);
        applyRuntime(loaded, initialPreset.values);
      })
      .catch(
        () => active && setLoadError("This trace runtime could not be loaded."),
      );
    return () => {
      active = false;
    };
  }, [applyRuntime, initialPreset.values, problem.slug]);

  useEffect(() => {
    if (!playback.playing) return;
    if (checkpoint && !isRevealed) {
      dispatch({ type: "pause" });
      return;
    }
    const generation = playback.generation;
    const timer = window.setTimeout(
      () => dispatch({ type: "tick", generation }),
      900 / playback.speed,
    );
    return () => window.clearTimeout(timer);
  }, [
    checkpoint,
    isRevealed,
    playback.generation,
    playback.index,
    playback.playing,
    playback.speed,
  ]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const first = issues[0]?.field;
    if (first) inputRefs.current[first]?.focus();
  }, [issues]);

  useEffect(() => {
    if (activePanel !== "code") return;
    const viewport = codeViewportRef.current;
    const activeLine = activeCodeLineRef.current;
    if (viewport && activeLine && typeof viewport.scrollTo === "function") {
      viewport.scrollTo({
        behavior: reducedMotion ? "auto" : "smooth",
        top: Math.max(
          0,
          activeLine.offsetTop -
            (viewport.clientHeight - activeLine.clientHeight) / 2,
        ),
      });
    }
  }, [activePanel, playback.index, reducedMotion]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!runtime) return;
    applyRuntime(runtime, raw);
  }

  function choosePreset(presetId: string) {
    const preset = problem.presets.find((item) => item.id === presetId);
    if (!preset || !runtime) return;
    setSelectedPreset(preset.id);
    setRaw(preset.values);
    applyRuntime(runtime, preset.values);
  }

  function updateRaw(field: string, value: string) {
    dispatch({ type: "pause" });
    setSelectedPreset("custom");
    setRaw((current) => ({ ...current, [field]: value }));
  }

  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.target !== event.currentTarget ||
      isTypingTarget(event.target) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    if (["ArrowLeft", "ArrowRight", "Home", "End", " "].includes(event.key))
      event.preventDefault();
    if (event.key === "ArrowLeft") dispatch({ type: "previous" });
    else if (event.key === "ArrowRight") dispatch({ type: "next" });
    else if (event.key === "Home") dispatch({ type: "seek", index: 0 });
    else if (event.key === "End")
      dispatch({ type: "seek", index: playback.frameCount - 1 });
    else if (event.key === " ")
      dispatch({ type: playback.playing ? "pause" : "play" });
  }

  function completeAndReturn() {
    if (!source) return;
    setProblemCompletion(source.day, problem.lc, true);
    router.push(`/practice?week=${source.week}#day-${source.day}`);
  }

  function showVisual() {
    setActivePanel("visual");
  }

  function showCode() {
    setActivePanel("code");
  }

  const changedVariables = frame
    ? frame.variables.filter((variable) => variable.changed)
    : [];
  const quickVariables = frame
    ? changedVariables.length
      ? changedVariables
      : frame.variables.slice(0, 3)
    : [];
  const hasMoreVariables = Boolean(
    frame && quickVariables.length < frame.variables.length,
  );
  const firstActiveCodeLine = frame
    ? problem.codeLines.find((line) =>
        line.anchorIds.some((id) => frame.codeRefs.includes(id)),
      )?.number
    : undefined;

  return (
    <div
      aria-label={`${problem.title} trace workspace. Use arrow keys, Home, End, or Space while this workspace is focused.`}
      className={styles.workspace}
      onKeyDown={keyboard}
      role="region"
      tabIndex={0}
    >
      <section aria-label="Current input" className={styles.caseBar}>
        <div className={styles.caseSummary}>
          <span className={styles.kicker}>Current case</span>
          <div>
            {problem.fields.map((field) => (
              <span key={field.id}>
                <strong>{field.label}</strong> {raw[field.id] || "empty"}
              </span>
            ))}
          </div>
        </div>
        <label className={styles.preset}>
          <span>Preset</span>
          <select
            aria-label="Choose a preset"
            disabled={!runtime}
            onChange={(event) => choosePreset(event.target.value)}
            value={selectedPreset}
          >
            {selectedPreset === "custom" ? (
              <option value="custom">Custom case</option>
            ) : null}
            {problem.presets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          aria-controls="trace-input-editor"
          aria-expanded={inputOpen}
          className={styles.editButton}
          onClick={() => setInputOpen((open) => !open)}
          type="button"
        >
          {inputOpen ? "Close editor" : "Edit input"}
        </button>
      </section>

      {inputOpen ? (
        <section
          aria-labelledby="input-bench-title"
          className={styles.inputBench}
          id="trace-input-editor"
        >
          <div className={styles.inputHeading}>
            <div>
              <span className={styles.kicker}>Input bench</span>
              <h2 id="input-bench-title">Try a different interview case</h2>
            </div>
            <p>The current valid trace stays visible until this case passes.</p>
          </div>
          <form className={styles.form} noValidate onSubmit={submit}>
            {problem.fields.map((field) => {
              const issue = issues.find((item) => item.field === field.id);
              const shared = {
                "aria-describedby": `${field.id}-help${issue ? ` ${field.id}-error` : ""}`,
                "aria-invalid": Boolean(issue),
                id: field.id,
                name: field.id,
                onChange: (
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >,
                ) => updateRaw(field.id, event.target.value),
                placeholder: field.placeholder,
                value: raw[field.id] ?? "",
              };
              return (
                <div className={styles.field} key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      {...shared}
                      ref={(node) => {
                        inputRefs.current[field.id] = node;
                      }}
                      rows={2}
                    />
                  ) : (
                    <input
                      {...shared}
                      inputMode={field.inputMode}
                      ref={(node) => {
                        inputRefs.current[field.id] = node;
                      }}
                      type={field.type === "integer" ? "text" : field.type}
                    />
                  )}
                  <small id={`${field.id}-help`}>{field.help}</small>
                  {issue ? (
                    <strong id={`${field.id}-error`} role="alert">
                      {issue.message}
                    </strong>
                  ) : null}
                </div>
              );
            })}
            <button
              className={styles.runButton}
              disabled={!runtime}
              type="submit"
            >
              Generate trace
            </button>
          </form>
          {loadError ? (
            <div className={styles.runtimeError} role="alert">
              <span>{loadError}</span>
              <button
                onClick={() => {
                  setSelectedPreset(initialPreset.id);
                  setRaw(initialPreset.values);
                  if (runtime) applyRuntime(runtime, initialPreset.values);
                }}
                type="button"
              >
                Reset preset
              </button>
            </div>
          ) : null}
        </section>
      ) : loadError ? (
        <div className={styles.runtimeError} role="alert">
          <span>{loadError}</span>
          <button onClick={() => setInputOpen(true)} type="button">
            Open input editor
          </button>
        </div>
      ) : null}

      {run && frame ? (
        <>
          <section
            aria-labelledby="trace-step-title"
            className={styles.stepBrief}
          >
            <div className={styles.stepProgress}>
              <span className={styles.kicker}>{frame.phase}</span>
              <span>
                Step {playback.index + 1} of {run.frames.length}
              </span>
              <progress
                aria-label={`Step ${playback.index + 1} of ${run.frames.length}`}
                max={run.frames.length}
                value={playback.index + 1}
              />
            </div>
            <div className={styles.briefGrid}>
              <div>
                <h2 id="trace-step-title">{frame.explanation}</h2>
                <p className={styles.changed}>
                  <span>Changed</span> {frame.changed}
                </p>
              </div>
              <div className={styles.invariant}>
                <span>Invariant</span>
                <p>{frame.invariant}</p>
              </div>
            </div>
            {quickVariables.length ? (
              <div className={styles.variableRail}>
                <span className={styles.railLabel}>
                  {frame.variables.some((variable) => variable.changed)
                    ? "State delta"
                    : "Key state"}
                </span>
                <dl>
                  {quickVariables.map((variable) => (
                    <VariableValue key={variable.name} variable={variable} />
                  ))}
                </dl>
                {hasMoreVariables ? (
                  <details className={styles.allVariables}>
                    <summary>All variables</summary>
                    <dl>
                      {frame.variables.map((variable) => (
                        <VariableValue
                          key={variable.name}
                          variable={variable}
                        />
                      ))}
                    </dl>
                  </details>
                ) : null}
              </div>
            ) : null}
            <p aria-atomic="true" aria-live="polite" className="sr-only">
              {playback.playing
                ? ""
                : `${frame.phase}. ${frame.explanation} ${frame.changed}`}
            </p>
          </section>

          {checkpoint ? (
            <section
              aria-labelledby={`checkpoint-${frame.id}`}
              className={styles.checkpoint}
            >
              <fieldset>
                <legend id={`checkpoint-${frame.id}`}>
                  <span className={styles.kicker}>Predict the next move</span>
                  {checkpoint.prompt}
                </legend>
                <div className={styles.checkpointOptions}>
                  {checkpoint.options.map((option) => (
                    <label key={option.id}>
                      <input
                        checked={answer === option.id}
                        name={`checkpoint-${frame.id}`}
                        onChange={() => {
                          setCheckpointAnswers((current) => ({
                            ...current,
                            [frame.id]: option.id,
                          }));
                          setRevealed((current) => ({
                            ...current,
                            [frame.id]: false,
                          }));
                        }}
                        type="radio"
                        value={option.id}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <button
                  aria-controls={`checkpoint-feedback-${frame.id}`}
                  aria-expanded={isRevealed}
                  disabled={!answer}
                  onClick={() =>
                    setRevealed((current) => ({
                      ...current,
                      [frame.id]: true,
                    }))
                  }
                  type="button"
                >
                  Reveal reasoning
                </button>
                <p
                  aria-atomic="true"
                  aria-live="polite"
                  className={
                    isRevealed
                      ? answer === checkpoint.answerId
                        ? styles.correct
                        : styles.incorrect
                      : styles.feedbackPlaceholder
                  }
                  id={`checkpoint-feedback-${frame.id}`}
                  role="status"
                >
                  {isRevealed ? (
                    <>
                      <strong>
                        {answer === checkpoint.answerId
                          ? "That’s it."
                          : "Reconsider the invariant."}
                      </strong>{" "}
                      {checkpoint.explanation}
                    </>
                  ) : null}
                </p>
              </fieldset>
            </section>
          ) : null}

          {frame.complete ? (
            <section className={styles.complete}>
              <div>
                <span className={styles.kicker}>Trace complete</span>
                <h2>Output: {formatValue(run.output)}</h2>
              </div>
              {source ? (
                <button onClick={completeAndReturn} type="button">
                  Mark complete & return to Day {source.day}
                </button>
              ) : (
                <button onClick={() => router.push("/practice")} type="button">
                  Return to practice
                </button>
              )}
            </section>
          ) : null}

          <div
            aria-label="Trace playback"
            className={styles.transport}
            role="toolbar"
          >
            <div className={styles.transportMoves}>
              <button
                aria-label="Previous step"
                disabled={playback.index === 0}
                onClick={() => dispatch({ type: "previous" })}
                type="button"
              >
                Back
              </button>
              <button
                aria-label={playback.playing ? "Pause trace" : "Play trace"}
                disabled={
                  playback.frameCount <= 1 || Boolean(checkpoint && !isRevealed)
                }
                onClick={() =>
                  dispatch({ type: playback.playing ? "pause" : "play" })
                }
                type="button"
              >
                {playback.playing ? "Pause" : "Play"}
              </button>
              <button
                aria-label="Next step"
                disabled={playback.index >= playback.frameCount - 1}
                onClick={() => dispatch({ type: "next" })}
                type="button"
              >
                Next
              </button>
            </div>
            <label className={styles.scrubber}>
              <span className="sr-only">Trace step</span>
              <input
                aria-valuetext={`Step ${playback.index + 1} of ${playback.frameCount}`}
                max={Math.max(0, playback.frameCount - 1)}
                min="0"
                onChange={(event) =>
                  dispatch({ type: "seek", index: Number(event.target.value) })
                }
                type="range"
                value={playback.index}
              />
              <span>
                {playback.index + 1}/{playback.frameCount}
              </span>
            </label>
            <div className={styles.transportOptions}>
              <label>
                <span>Speed</span>
                <select
                  aria-label="Playback speed"
                  onChange={(event) =>
                    dispatch({
                      type: "speed",
                      speed: Number(
                        event.target.value,
                      ) as (typeof TRACE_SPEEDS)[number],
                    })
                  }
                  value={playback.speed}
                >
                  {TRACE_SPEEDS.map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}×
                    </option>
                  ))}
                </select>
              </label>
              <button
                aria-label="Restart trace"
                disabled={playback.index === 0}
                onClick={() => dispatch({ type: "restart" })}
                type="button"
              >
                Start over
              </button>
            </div>
          </div>

          <div
            aria-label="Workspace view"
            className={styles.viewSwitch}
            role="group"
          >
            <button
              aria-controls="trace-visual-panel"
              aria-pressed={activePanel === "visual"}
              onClick={showVisual}
              type="button"
            >
              State
            </button>
            <button
              aria-controls="trace-code-panel"
              aria-pressed={activePanel === "code"}
              onClick={showCode}
              type="button"
            >
              Java
            </button>
          </div>

          <div
            className={styles.mainGrid}
            data-code-open={activePanel === "code"}
          >
            <section
              aria-label="Algorithm state"
              className={styles.visualPanel}
              data-active={activePanel === "visual"}
              id="trace-visual-panel"
            >
              <header>
                <span className={styles.kicker}>State canvas</span>
                <strong>
                  Focus:{" "}
                  {frame.scenes.find((scene) => scene.id === frame.focusSceneId)
                    ?.title ?? frame.scenes[0]?.title}
                </strong>
              </header>
              <TraceSceneDeck
                focusSceneId={frame.focusSceneId}
                scenes={frame.scenes}
              />
            </section>

            {activePanel === "code" ? (
              <section
                aria-label="Java source"
                className={styles.codePanel}
                data-active="true"
                id="trace-code-panel"
              >
                <header>
                  <span className={styles.kicker}>Java source</span>
                  <strong>
                    {problem.time} time · {problem.space} space
                  </strong>
                </header>
                <pre ref={codeViewportRef}>
                  <code>
                    {problem.codeLines.map((line) => {
                      const active = line.anchorIds.some((id) =>
                        frame.codeRefs.includes(id),
                      );
                      return (
                        <span
                          aria-current={active ? "step" : undefined}
                          className={`${styles.codeLine} ${active ? styles.activeLine : ""}`}
                          key={line.number}
                          ref={
                            line.number === firstActiveCodeLine
                              ? activeCodeLineRef
                              : undefined
                          }
                        >
                          <span aria-hidden className={styles.lineNumber}>
                            {line.number}
                          </span>
                          <span>
                            {line.tokens.map((token, index) => (
                              <span
                                className={styles.token}
                                key={index}
                                style={
                                  {
                                    "--token-light": token.light,
                                    "--token-dark": token.dark,
                                  } as React.CSSProperties
                                }
                              >
                                {token.content}
                              </span>
                            ))}
                          </span>
                        </span>
                      );
                    })}
                  </code>
                </pre>
              </section>
            ) : null}
          </div>
        </>
      ) : !loadError ? (
        <p className={styles.loading} role="status">
          Preparing the first trace…
        </p>
      ) : null}
    </div>
  );
}
