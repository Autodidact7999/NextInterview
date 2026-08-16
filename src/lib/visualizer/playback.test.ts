import { describe, expect, it } from "vitest";

import {
  initialPlaybackState,
  playbackReducer,
} from "@/lib/visualizer/playback";

describe("playbackReducer", () => {
  it("clamps manual navigation and pauses", () => {
    let state = initialPlaybackState(3);
    state = playbackReducer(state, { type: "previous" });
    expect(state.index).toBe(0);
    state = playbackReducer(state, { type: "seek", index: 99 });
    expect(state.index).toBe(2);
    expect(state.playing).toBe(false);
  });

  it("replays from the beginning and stops at the final frame", () => {
    let state = { ...initialPlaybackState(2), index: 1 };
    state = playbackReducer(state, { type: "play" });
    expect(state).toMatchObject({ index: 0, playing: true });
    state = playbackReducer(state, {
      type: "tick",
      generation: state.generation,
    });
    expect(state).toMatchObject({ index: 1, playing: false });
  });

  it("ignores stale timer generations", () => {
    let state = playbackReducer(initialPlaybackState(4), { type: "play" });
    const stale = state.generation;
    state = playbackReducer(state, { type: "seek", index: 2 });
    expect(playbackReducer(state, { type: "tick", generation: stale })).toEqual(
      state,
    );
  });

  it("keeps one-frame traces paused", () => {
    expect(
      playbackReducer(initialPlaybackState(1), { type: "play" }).playing,
    ).toBe(false);
  });

  it("invalidates timers for speed changes and replacement runs", () => {
    let state = playbackReducer(initialPlaybackState(5), { type: "play" });
    const playingGeneration = state.generation;
    state = playbackReducer(state, { type: "speed", speed: 2 });
    expect(state).toMatchObject({ playing: true, speed: 2 });
    expect(state.generation).toBeGreaterThan(playingGeneration);
    state = playbackReducer(state, { type: "load", frameCount: 2 });
    expect(state).toMatchObject({
      index: 0,
      frameCount: 2,
      playing: false,
      speed: 2,
    });
  });
});
