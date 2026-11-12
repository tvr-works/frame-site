import { initialState, transition, type Command, type DemoState } from "./model";
export const story: { command: Command; caption: string; keys?: string }[] = [
  {
    command: { type: "create", kind: "browser" },
    caption: "Open a window. Frame gives it the whole workspace.",
  },
  { command: { type: "create", kind: "notes" }, caption: "A second window opens in a new column." },
  {
    command: { type: "focus", direction: "left" },
    caption: "Focus changes the active window. Everything stays in place.",
    keys: "⌥ H",
  },
  {
    command: { type: "create", kind: "editor" },
    caption: "The next window joins the focused column.",
  },
  {
    command: { type: "move", direction: "right" },
    caption: "Move pushes the window into the next column.",
    keys: "⌥ ⇧ L",
  },
  {
    command: { type: "resize", direction: "right" },
    caption: "Resize shifts the active column boundary.",
    keys: "⌃ ⇧ ⌥ L",
  },
  {
    command: { type: "send", name: "2" },
    caption: "Send a window to another workspace. Stay where you are.",
    keys: "⌥ ⇧ 2",
  },
  {
    command: { type: "workspace", name: "2" },
    caption: "Switch workspace to pick up where you left off.",
    keys: "⌥ 2",
  },
  {
    command: { type: "create", kind: "terminal" },
    caption: "Keep your tools together, across your displays.",
  },
  {
    command: { type: "focus", direction: "left" },
    caption: "Your turn. Click any window or open one of your own.",
    keys: "⌥ H",
  },
];
export type PlaybackMode = "playing" | "paused" | "manual" | "complete";
export interface DemoSession {
  state: DemoState;
  step: number;
  mode: PlaybackMode;
  caption: string;
  keys?: string;
}
export type SessionEvent =
  | { type: "tick" }
  | { type: "user"; command?: Command }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "replay" };
export function initialSession(): DemoSession {
  return {
    state: initialState(),
    step: 0,
    mode: "paused",
    caption: "A clear desktop. Watch it come together, or open a window.",
  };
}
export function sessionTransition(s: DemoSession, event: SessionEvent): DemoSession {
  switch (event.type) {
    case "user": {
      const state = event.command ? transition(s.state, event.command) : s.state;
      return {
        ...s,
        state,
        mode: "manual",
        keys: undefined,
        caption: event.command
          ? state.message
          : "You’re in control. Open a window, then make it your own.",
      };
    }
    case "tick": {
      if (s.mode !== "playing") return s;
      const next = story[s.step];
      if (!next) return { ...s, mode: "complete" };
      return {
        ...s,
        state: transition(s.state, next.command),
        step: s.step + 1,
        mode: s.step + 1 === story.length ? "complete" : "playing",
        caption: next.caption,
        keys: next.keys,
      };
    }
    case "pause":
      return s.mode === "playing" ? { ...s, mode: "paused" } : s;
    case "resume":
      return s.mode === "paused" ? { ...s, mode: "playing" } : s;
    case "reset":
      return {
        ...initialSession(),
        state: initialState(s.state.visible.length as 1 | 2),
        mode: "manual",
        caption: "A clear desktop. Open a window to begin.",
      };
    case "replay":
      return {
        ...initialSession(),
        state: initialState(s.state.visible.length as 1 | 2),
        mode: "playing",
      };
  }
}
