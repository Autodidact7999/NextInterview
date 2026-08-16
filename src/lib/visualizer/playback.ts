export const TRACE_SPEEDS = [0.5, 1, 1.5, 2] as const;
export type TraceSpeed = (typeof TRACE_SPEEDS)[number];

export interface PlaybackState {
  index: number;
  frameCount: number;
  playing: boolean;
  speed: TraceSpeed;
  generation: number;
}

export type PlaybackAction =
  | { type: "load"; frameCount: number }
  | { type: "play" }
  | { type: "pause" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "seek"; index: number }
  | { type: "restart" }
  | { type: "speed"; speed: TraceSpeed }
  | { type: "tick"; generation: number };

export function initialPlaybackState(frameCount: number): PlaybackState {
  return { index: 0, frameCount, playing: false, speed: 1, generation: 0 };
}

function clamp(index: number, frameCount: number): number {
  return Math.max(0, Math.min(index, Math.max(0, frameCount - 1)));
}

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState {
  switch (action.type) {
    case "load":
      return {
        ...initialPlaybackState(action.frameCount),
        speed: state.speed,
        generation: state.generation + 1,
      };
    case "pause":
      return state.playing
        ? { ...state, playing: false, generation: state.generation + 1 }
        : state;
    case "play":
      if (state.frameCount <= 1) return state;
      return {
        ...state,
        index: state.index >= state.frameCount - 1 ? 0 : state.index,
        playing: true,
        generation: state.generation + 1,
      };
    case "next":
      return {
        ...state,
        index: clamp(state.index + 1, state.frameCount),
        playing: false,
        generation: state.generation + 1,
      };
    case "previous":
      return {
        ...state,
        index: clamp(state.index - 1, state.frameCount),
        playing: false,
        generation: state.generation + 1,
      };
    case "seek":
      return {
        ...state,
        index: clamp(action.index, state.frameCount),
        playing: false,
        generation: state.generation + 1,
      };
    case "restart":
      return {
        ...state,
        index: 0,
        playing: false,
        generation: state.generation + 1,
      };
    case "speed":
      return {
        ...state,
        speed: action.speed,
        generation: state.generation + 1,
      };
    case "tick": {
      if (!state.playing || action.generation !== state.generation)
        return state;
      const next = clamp(state.index + 1, state.frameCount);
      return { ...state, index: next, playing: next < state.frameCount - 1 };
    }
  }
}
