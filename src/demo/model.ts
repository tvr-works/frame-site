/** Bounded port of FrameEngine's depth-two columns model. See docs/simulator.md. */
export const workspaceNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
export type Direction = "left" | "down" | "up" | "right";
export type WindowKind = "browser" | "notes" | "editor" | "terminal";
export interface DemoWindow {
  id: number;
  kind: WindowKind;
  weight: number;
  recent: number;
}
export interface Column {
  id: number;
  recent: number;
  weight: number;
  windows: DemoWindow[];
}
export interface Workspace {
  name: string;
  monitor: number;
  columns: Column[];
}
export interface DemoState {
  workspaces: Workspace[];
  visible: string[];
  workspace: string;
  focused: number | null;
  nextId: number;
  clock: number;
  message: string;
}
export type Command =
  | { type: "create"; kind?: WindowKind }
  | { type: "close" }
  | { type: "select"; id: number }
  | { type: "monitor"; index: number }
  | { type: "monitors"; count: 1 | 2 }
  | { type: "focus" | "move" | "resize"; direction: Direction }
  | { type: "workspace" | "send"; name: string };
export const surface = { width: 1440, height: 900, gap: 8 };
export const windowTitles: Record<WindowKind, string> = {
  browser: "Reading",
  notes: "Notes",
  editor: "main.swift",
  terminal: "Terminal",
};
const kinds: WindowKind[] = ["browser", "notes", "editor", "terminal"];
export function initialState(count: 1 | 2 = 2): DemoState {
  return {
    workspaces: workspaceNames.map((name) => ({
      name,
      monitor: name === "2" && count === 2 ? 1 : 0,
      columns: [],
    })),
    visible: count === 2 ? ["1", "2"] : ["1"],
    workspace: "1",
    focused: null,
    nextId: 1,
    clock: 0,
    message: "A clear desktop. Open a window to begin.",
  };
}
export function currentWorkspace(s: DemoState) {
  return s.workspaces.find((w) => w.name === s.workspace)!;
}
function allWindows(w: Workspace) {
  return w.columns.flatMap((c) => c.windows);
}
function recentWindow(windows: DemoWindow[]) {
  return windows.reduce<DemoWindow | undefined>(
    (a, b) => (!a || b.recent > a.recent ? b : a),
    undefined,
  );
}
function recentWorkspaceWindow(w: Workspace) {
  const column = w.columns
    .filter((c) => c.windows.length)
    .reduce<Column | undefined>((a, b) => (!a || b.recent > a.recent ? b : a), undefined);
  return column ? recentWindow(column.windows) : undefined;
}
function focus(s: DemoState, w: Workspace, window?: DemoWindow) {
  s.workspace = w.name;
  s.focused = window?.id ?? null;
  if (window) {
    window.recent = ++s.clock;
    const column = w.columns.find((c) => c.windows.includes(window));
    if (column) column.recent = s.clock;
  }
}
function activate(s: DemoState, w: Workspace) {
  s.visible[w.monitor] = w.name;
  focus(s, w, recentWorkspaceWindow(w));
}
function average(items: { weight: number }[]) {
  return items.length ? items.reduce((a, b) => a + b.weight, 0) / items.length : 1;
}
function column(s: DemoState, w: Workspace, index = w.columns.length) {
  const c: Column = { id: s.nextId++, recent: ++s.clock, weight: average(w.columns), windows: [] };
  w.columns.splice(index, 0, c);
  return c;
}
function normalizeWeights(items: { weight: number }[], size: number) {
  if (!items.length) return;
  const delta = (size - items.reduce((a, b) => a + b.weight, 0)) / items.length;
  for (const item of items) item.weight += delta;
}
function normalize(s: DemoState) {
  for (const w of s.workspaces) {
    w.columns = w.columns.filter((c) => c.windows.length);
    if (s.visible.includes(w.name)) {
      normalizeWeights(w.columns, surface.width - 16);
      for (const c of w.columns) normalizeWeights(c.windows, surface.height - 17);
    }
  }
  const w = currentWorkspace(s);
  if (!allWindows(w).some((x) => x.id === s.focused)) focus(s, w, recentWorkspaceWindow(w));
}
/** Commands are immutable. Rendering and autoplay cannot mutate layout state. */
export function transition(input: DemoState, command: Command): DemoState {
  const s = structuredClone(input),
    w = currentWorkspace(s);
  const c = w.columns.find((c) => c.windows.some((x) => x.id === s.focused));
  const win = c?.windows.find((x) => x.id === s.focused);
  s.message = "";
  switch (command.type) {
    case "create": {
      if (allWindows(w).length >= 6) {
        s.message = "This demo supports six windows per workspace. Close one to keep exploring.";
        break;
      }
      const target = w.columns.length === 1 ? column(s, w) : (c ?? column(s, w));
      const kind = command.kind ?? kinds[s.workspaces.flatMap(allWindows).length % kinds.length];
      const added: DemoWindow = {
        id: s.nextId++,
        kind,
        weight: average(target.windows),
        recent: ++s.clock,
      };
      target.windows.push(added);
      focus(s, w, added);
      s.message = `Opened ${windowTitles[kind]}. ${w.columns.length} ${w.columns.length === 1 ? "column" : "columns"}.`;
      break;
    }
    case "select": {
      const ws = s.workspaces.find((x) => allWindows(x).some((y) => y.id === command.id));
      const target = ws && allWindows(ws).find((x) => x.id === command.id);
      if (ws && target) {
        activate(s, ws);
        focus(s, ws, target);
        s.message = `Focused ${windowTitles[target.kind]}. Layout unchanged.`;
      }
      break;
    }
    case "monitor": {
      const ws = s.workspaces.find((x) => x.name === s.visible[command.index]);
      if (ws) {
        activate(s, ws);
        s.message = `Focused display ${command.index + 1}, workspace ${ws.name}.`;
      }
      break;
    }
    case "monitors": {
      if (command.count === s.visible.length) break;
      if (command.count === 1) {
        s.visible = [s.workspace];
        for (const ws of s.workspaces) ws.monitor = 0;
      } else {
        const other =
          s.workspaces.find((ws) => !s.visible.includes(ws.name) && !allWindows(ws).length) ??
          s.workspaces.find((ws) => !s.visible.includes(ws.name))!;
        other.monitor = 1;
        s.visible.push(other.name);
      }
      s.message = `${command.count === 1 ? "Single display" : "Two displays"}. Your windows are preserved.`;
      break;
    }
    case "workspace": {
      const ws = s.workspaces.find((x) => x.name === command.name);
      if (!ws) break;
      activate(s, ws);
      s.message = `Workspace ${ws.name}, display ${ws.monitor + 1}. ${allWindows(ws).length} windows.`;
      break;
    }
    case "send": {
      const ws = s.workspaces.find((x) => x.name === command.name);
      if (!ws || !win || !c) {
        s.message = "Open or focus a window first.";
        break;
      }
      if (ws === w) {
        s.message = `Already on workspace ${ws.name}.`;
        break;
      }
      if (allWindows(ws).length >= 6) {
        s.message = "The destination has reached this demo’s six-window limit.";
        break;
      }
      const target = ws.columns.at(-1) ?? column(s, ws);
      c.windows = c.windows.filter((x) => x !== win);
      win.weight = average(target.windows);
      win.recent = ++s.clock;
      target.recent = s.clock;
      target.windows.push(win);
      s.focused = null;
      focus(s, w, recentWorkspaceWindow(w));
      s.message = `Sent ${windowTitles[win.kind]} to workspace ${ws.name}. Focus stays on workspace ${w.name}.`;
      break;
    }
    case "close": {
      if (!c || !win) {
        s.message = "No window to close.";
        break;
      }
      c.windows = c.windows.filter((x) => x !== win);
      s.focused = null;
      s.message = `Closed ${windowTitles[win.kind]}. Remaining windows retile.`;
      break;
    }
    case "focus": {
      if (!c || !win) {
        s.message = "Open a window first.";
        break;
      }
      const horizontal = command.direction === "left" || command.direction === "right";
      const delta = command.direction === "left" || command.direction === "up" ? -1 : 1;
      const target = horizontal
        ? recentWindow(w.columns[w.columns.indexOf(c) + delta]?.windows ?? [])
        : c.windows[c.windows.indexOf(win) + delta];
      if (target) {
        focus(s, w, target);
        s.message = `Focused ${windowTitles[target.kind]}. Layout unchanged.`;
      } else s.message = "At the workspace edge. Focus stops here.";
      break;
    }
    case "move": {
      if (!c || !win) {
        s.message = "Open a window first.";
        break;
      }
      const delta = command.direction === "left" || command.direction === "up" ? -1 : 1;
      if (command.direction === "up" || command.direction === "down") {
        const index = c.windows.indexOf(win),
          target = index + delta;
        if (!c.windows[target]) {
          s.message = "At the column edge. The window stays here.";
          break;
        }
        c.windows.splice(index, 1);
        c.windows.splice(target, 0, win);
      } else {
        const index = w.columns.indexOf(c),
          targetIndex = index + delta;
        if (!w.columns[targetIndex] && w.columns.length >= 4) {
          s.message = "This demo supports up to four columns.";
          break;
        }
        const target = w.columns[targetIndex] ?? column(s, w, delta < 0 ? 0 : w.columns.length);
        c.windows = c.windows.filter((x) => x !== win);
        win.weight = average(target.windows);
        target.windows.push(win);
      }
      focus(s, w, win);
      s.message = `Moved ${windowTitles[win.kind]} ${command.direction}. Focus follows the window.`;
      break;
    }
    case "resize": {
      if (!c || !win) {
        s.message = "Open a window first.";
        break;
      }
      const horizontal = command.direction === "left" || command.direction === "right";
      const siblings: { weight: number }[] = horizontal ? w.columns : c.windows;
      const node = horizontal ? c : win;
      if (siblings.length < 2) {
        s.message = `Add another ${horizontal ? "column" : "window in this column"} to resize.`;
        break;
      }
      const sign = siblings.at(-1) === node ? -1 : 1;
      const delta = (command.direction === "left" || command.direction === "up" ? -50 : 50) * sign;
      const share = delta / (siblings.length - 1);
      // Browser-demo readability bound, deliberately separate from native AX app minimum sizes.
      if (
        siblings.some((x) => x.weight + (x === node ? delta : -share) < (horizontal ? 180 : 150))
      ) {
        s.message = "Reached this demo’s minimum window size.";
        break;
      }
      for (const x of siblings) x.weight += x === node ? delta : -share;
      s.message = `Resized ${horizontal ? "column width" : "window height"} ${command.direction} by 50 points.`;
      break;
    }
  }
  normalize(s);
  return s;
}
export interface WindowRect {
  window: DemoWindow;
  x: number;
  y: number;
  width: number;
  height: number;
}
export function layout(w: Workspace): WindowRect[] {
  const result: WindowRect[] = [];
  let x = 8;
  w.columns.forEach((c, ci) => {
    let y = 8;
    c.windows.forEach((window, wi) => {
      result.push({
        window,
        x: x + (ci ? 4 : 0),
        y: y + (wi ? 4 : 0),
        width: c.weight - (ci ? 4 : 0) - (ci < w.columns.length - 1 ? 4 : 0),
        height: window.weight - (wi ? 4 : 0) - (wi < c.windows.length - 1 ? 4 : 0),
      });
      y += window.weight;
    });
    x += c.weight;
  });
  return result;
}
export function describe(s: DemoState) {
  const w = currentWorkspace(s);
  return `Workspace ${w.name} on display ${w.monitor + 1}. ${w.columns.length} columns, ${allWindows(w).length} windows. ${s.focused ? `Focused ${windowTitles[allWindows(w).find((x) => x.id === s.focused)!.kind]}.` : "No focused window."}`;
}
