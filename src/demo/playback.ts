import { initialState, transition, type Command, type DemoState } from "./model";

export type ShortcutMode = "focus" | "move" | "resize";
export interface ShortcutCue {
  mode: ShortcutMode;
  key?: string;
}
interface Beat {
  /** Time before this beat, including a reading pause after the previous action. */
  delay: number;
  command?: Command;
  /** Short, visible description of the structural result. */
  caption?: string;
  shortcut?: ShortcutCue;
  closeCue?: boolean;
}
function shortcut(
  command: Extract<Command, { direction: unknown } | { name: string }>,
  mode: ShortcutMode,
  key: string,
  caption: string,
  delay: number,
): Beat[] {
  return [{ delay, command, caption, shortcut: { mode, key } }];
}
function closeWindow(delay: number, caption: string): Beat[] {
  return [
    { delay: delay - 650, closeCue: true },
    { delay: 650, command: { type: "close" }, caption },
  ];
}
export const story: Beat[] = [
  {
    delay: 1200,
    command: { type: "create", kind: "browser" },
    caption: "First window, full workspace",
  },
  {
    delay: 1200,
    command: { type: "create", kind: "notes" },
    caption: "Second window, new column",
  },
  {
    delay: 1200,
    command: { type: "create", kind: "editor" },
    caption: "Then, new rows in focused column",
  },
  ...shortcut({ type: "focus", direction: "up" }, "focus", "K", "Focus window above", 2250),
  ...shortcut({ type: "focus", direction: "down" }, "focus", "J", "Focus window below", 1550),
  ...shortcut({ type: "focus", direction: "left" }, "focus", "H", "Focus window to the left", 1550),
  ...shortcut(
    { type: "focus", direction: "right" },
    "focus",
    "L",
    "Focus window to the right",
    1550,
  ),
  ...shortcut(
    { type: "move", direction: "right" },
    "move",
    "L",
    "Move window right into a new column",
    2450,
  ),
  ...shortcut(
    { type: "move", direction: "left" },
    "move",
    "H",
    "Move window one column left",
    1650,
  ),
  ...shortcut({ type: "move", direction: "up" }, "move", "K", "Move window up within column", 1650),
  ...shortcut(
    { type: "move", direction: "down" },
    "move",
    "J",
    "Move window down within column",
    1650,
  ),
  ...shortcut({ type: "resize", direction: "left" }, "resize", "H", "Expand column left", 2450),
  ...shortcut({ type: "resize", direction: "left" }, "resize", "H", "Expand column left", 1650),
  ...shortcut({ type: "resize", direction: "left" }, "resize", "H", "Expand column left", 1650),
  ...shortcut(
    { type: "resize", direction: "right" },
    "resize",
    "L",
    "Shrink column from the left",
    1650,
  ),
  ...shortcut({ type: "resize", direction: "up" }, "resize", "K", "Expand row upward", 2050),
  ...shortcut({ type: "resize", direction: "up" }, "resize", "K", "Expand row upward", 1650),
  ...shortcut(
    { type: "resize", direction: "down" },
    "resize",
    "J",
    "Shrink row from the top",
    1650,
  ),
  ...shortcut({ type: "send", name: "7" }, "move", "7", "Send window to workspace 7", 2450),
  ...shortcut({ type: "send", name: "1" }, "move", "1", "Return window to workspace 1", 2450),
  ...closeWindow(2400, "Close editor window"),
  ...closeWindow(1600, "Close Notes window"),
  ...closeWindow(1600, "Close Reading window"),
  { delay: 1800, caption: "Start with an empty workspace" },
];
export type PlaybackMode = "playing" | "paused";
export interface DemoSession {
  state: DemoState;
  replayVersion: number;
  closingWindow?: number;
  step: number;
  mode: PlaybackMode;
  caption: string;
  shortcut?: ShortcutCue;
}
export type SessionEvent =
  | { type: "tick" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "replay" };
export function initialSession(): DemoSession {
  return {
    state: initialState(),
    replayVersion: 0,
    step: 0,
    mode: "paused",
    caption: "Start with an empty workspace",
  };
}
export function sessionTransition(s: DemoSession, event: SessionEvent): DemoSession {
  switch (event.type) {
    case "tick": {
      if (s.mode !== "playing") return s;
      const next = story[s.step];
      if (!next) return s;
      // The final beat holds the empty scene, then restores the opening for the next cycle.
      if (s.step + 1 === story.length)
        return { ...initialSession(), mode: "playing", replayVersion: s.replayVersion };
      return {
        ...s,
        state: next.command ? transition(s.state, next.command) : s.state,
        step: s.step + 1,
        caption: next.caption ?? s.caption,
        shortcut: next.shortcut,
        closingWindow: next.closeCue ? (s.state.focused ?? undefined) : undefined,
      };
    }
    case "pause":
      return s.mode === "playing" ? { ...s, mode: "paused" } : s;
    case "resume":
      return s.mode === "paused" ? { ...s, mode: "playing" } : s;
    case "replay":
      return { ...initialSession(), mode: "playing", replayVersion: s.replayVersion + 1 };
  }
}
