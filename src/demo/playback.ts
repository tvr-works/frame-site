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
  caption: string;
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
  return [
    { delay, caption, shortcut: { mode } },
    { delay: 650, command, caption, shortcut: { mode, key } },
  ];
}
function closeWindow(delay: number, caption: string): Beat[] {
  return [
    {
      delay: delay - 450,
      caption: "The red dot highlights the next window to close.",
      closeCue: true,
    },
    { delay: 450, command: { type: "close" }, caption },
  ];
}
export const story: Beat[] = [
  {
    delay: 600,
    command: { type: "create", kind: "browser" },
    caption: "One window fills the workspace.",
  },
  {
    delay: 600,
    command: { type: "create", kind: "notes" },
    caption: "A second window opens in a new column.",
  },
  {
    delay: 600,
    command: { type: "create", kind: "editor" },
    caption: "A third window joins the focused column.",
  },
  ...shortcut(
    { type: "focus", direction: "up" },
    "focus",
    "K",
    "Option K focuses up within a column. The windows stay in place.",
    1200,
  ),
  ...shortcut(
    { type: "focus", direction: "down" },
    "focus",
    "J",
    "Option J focuses down in the same column.",
    900,
  ),
  ...shortcut(
    { type: "focus", direction: "left" },
    "focus",
    "H",
    "Option H focuses the window in the left column.",
    900,
  ),
  ...shortcut(
    { type: "focus", direction: "right" },
    "focus",
    "L",
    "Option L focuses right. The same directions work for every action.",
    900,
  ),
  ...shortcut(
    { type: "move", direction: "right" },
    "move",
    "L",
    "Add Shift: Option Shift L moves the focused window right into a new column.",
    1800,
  ),
  ...shortcut(
    { type: "move", direction: "left" },
    "move",
    "H",
    "Option Shift H moves the same window back into the neighboring column.",
    1000,
  ),
  ...shortcut(
    { type: "move", direction: "up" },
    "move",
    "K",
    "Option Shift K moves it above the other window in its column.",
    1000,
  ),
  ...shortcut(
    { type: "move", direction: "right" },
    "move",
    "L",
    "Option Shift L gives the window its own column again.",
    1000,
  ),
  ...shortcut(
    { type: "resize", direction: "right" },
    "resize",
    "L",
    "Add Control: Option Shift Control L shifts the column boundary to resize the window.",
    1800,
  ),
  ...shortcut(
    { type: "resize", direction: "right" },
    "resize",
    "L",
    "Repeat the same chord to resize another step.",
    700,
  ),
  ...shortcut(
    { type: "resize", direction: "right" },
    "resize",
    "L",
    "One more step, keeping the same window focused.",
    700,
  ),
  ...shortcut(
    { type: "resize", direction: "left" },
    "resize",
    "H",
    "Option Shift Control H adjusts the boundary in the other direction.",
    700,
  ),
  ...shortcut(
    { type: "send", name: "7" },
    "move",
    "7",
    "Option Shift 7 sends the window to workspace 7 on the right display. Focus follows.",
    1800,
  ),
  ...shortcut(
    { type: "send", name: "1" },
    "move",
    "1",
    "Option Shift 1 brings the same window back to workspace 1 on the left display. Focus follows back.",
    1800,
  ),
  ...closeWindow(1800, "Close one window. The others retile."),
  ...closeWindow(600, "Close the next window."),
  ...closeWindow(600, "Back to empty monitors."),
  { delay: 1200, caption: "An empty desktop, ready to begin again." },
];
export type PlaybackMode = "playing" | "paused";
export interface DemoSession {
  state: DemoState;
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
    step: 0,
    mode: "paused",
    caption: "The demo starts with empty monitors, then opens three windows.",
  };
}
export function sessionTransition(s: DemoSession, event: SessionEvent): DemoSession {
  switch (event.type) {
    case "tick": {
      if (s.mode !== "playing") return s;
      const next = story[s.step];
      if (!next) return s;
      // The final beat holds the empty scene, then restores the opening for the next cycle.
      if (s.step + 1 === story.length) return { ...initialSession(), mode: "playing" };
      return {
        ...s,
        state: next.command ? transition(s.state, next.command) : s.state,
        step: s.step + 1,
        caption: next.caption,
        shortcut: next.shortcut,
        closingWindow: next.closeCue ? (s.state.focused ?? undefined) : undefined,
      };
    }
    case "pause":
      return s.mode === "playing" ? { ...s, mode: "paused" } : s;
    case "resume":
      return s.mode === "paused" ? { ...s, mode: "playing" } : s;
    case "replay":
      return { ...initialSession(), mode: "playing" };
  }
}
