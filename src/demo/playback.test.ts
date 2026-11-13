import { describe, it, expect } from "vitest";
import { initialSession, sessionTransition, story } from "./playback";
import { currentWorkspace, layout, type DemoState } from "./model";
const geometry = (state: DemoState) =>
  layout(currentWorkspace(state)).map(({ window, x, y, width, height }) => ({
    id: window.id,
    x,
    y,
    width,
    height,
  }));

describe("scripted playback", () => {
  it("opens exactly three windows before any shortcut and keeps setup keys quiet", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    expect(s.state.focused).toBeNull();
    for (let i = 0; i < 3; i++) {
      s = sessionTransition(s, { type: "tick" });
      expect(currentWorkspace(s.state).columns.flatMap((c) => c.windows)).toHaveLength(i + 1);
      expect(s.shortcut).toBeUndefined();
    }
    expect(story.slice(0, 3).map((beat) => beat.command?.type)).toEqual([
      "create",
      "create",
      "create",
    ]);
    expect(story[3].delay).toBeGreaterThan(story[2].delay);
  });
  it("updates the label and full chord with each focus, move, resize and transfer action", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    for (const beat of story) {
      const before = s;
      s = sessionTransition(s, { type: "tick" });
      if (beat.shortcut) {
        expect(beat.command).toBeDefined();
        expect(beat.shortcut.key).toBeDefined();
        expect(s.caption).toBe(beat.caption);
        expect(s.shortcut).toEqual(beat.shortcut);
      }
      if (beat.closeCue) {
        expect(s.caption).toBe(before.caption);
        expect(s.closingWindow).toBe(before.state.focused);
        expect(s.state).toBe(before.state);
        expect(s.shortcut).toBeUndefined();
        const paused = sessionTransition(s, { type: "pause" });
        expect(paused.closingWindow).toBe(s.closingWindow);
        expect(sessionTransition(paused, { type: "tick" })).toBe(paused);
        expect(sessionTransition(paused, { type: "replay" }).closingWindow).toBeUndefined();
      }
      if (beat.command?.type === "close") {
        expect(before.closingWindow).toBe(before.state.focused);
        expect(
          s.state.workspaces
            .flatMap((w) => w.columns.flatMap((c) => c.windows))
            .some((win) => win.id === before.closingWindow),
        ).toBe(false);
        expect(s.closingWindow).toBeUndefined();
      }
      if (beat.command?.type === "focus") {
        expect(geometry(s.state)).toEqual(geometry(before.state));
        expect(s.state.focused).not.toBe(before.state.focused);
      }
      if (beat.command?.type === "move" || beat.command?.type === "resize") {
        expect(s.state.focused).toBe(before.state.focused);
        expect(geometry(s.state)).not.toEqual(geometry(before.state));
        expect(s.shortcut?.key).toBe(
          { left: "H", down: "J", up: "K", right: "L" }[beat.command.direction],
        );
      }
      if (beat.command?.type === "send") {
        expect(s.state.focused).toBe(before.state.focused);
        expect(s.state.visible).toEqual(["1", "7"]);
        expect(s.state.workspace).toBe(beat.command.name);
        expect(s.shortcut?.key).toBe(beat.command.name);
      }
    }
    expect(s).toEqual({ ...initialSession(), mode: "playing" });
  });
  it("shows both column width and row height changes matching their structural labels", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    const axes = new Set<string>();
    for (const beat of story) {
      const before = s;
      s = sessionTransition(s, { type: "tick" });
      if (beat.command?.type !== "resize") continue;
      const rect = (state: DemoState) =>
        layout(currentWorkspace(state)).find((tile) => tile.window.id === state.focused)!;
      const oldRect = rect(before.state);
      const newRect = rect(s.state);
      if (beat.command.direction === "left" || beat.command.direction === "right") {
        axes.add("column");
        const change = beat.command.direction === "left" ? 50 : -50;
        expect(newRect.width - oldRect.width).toBe(change);
        expect(newRect.x - oldRect.x).toBe(-change);
        expect(newRect.height).toBe(oldRect.height);
      } else {
        axes.add("row");
        const change = beat.command.direction === "up" ? 50 : -50;
        expect(newRect.height - oldRect.height).toBe(change);
        expect(newRect.y - oldRect.y).toBe(-change);
        expect(newRect.width).toBe(oldRect.width);
      }
    }
    expect(axes).toEqual(new Set(["column", "row"]));
  });
  it("closes windows individually, holds empty, and starts a fresh cycle without accumulating state", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    for (let cycle = 0; cycle < 2; cycle++) {
      let closed = 0;
      for (const beat of story) {
        s = sessionTransition(s, { type: "tick" });
        if (beat.command?.type === "close") {
          closed++;
          expect(
            s.state.workspaces.flatMap((w) => w.columns.flatMap((c) => c.windows)),
          ).toHaveLength(3 - closed);
          expect(s.shortcut).toBeUndefined();
          const paused = sessionTransition(s, { type: "pause" });
          expect(sessionTransition(paused, { type: "tick" })).toBe(paused);
        }
      }
      expect(closed).toBe(3);
      expect(s).toEqual({ ...initialSession(), mode: "playing" });
    }
  });
  it("pause preserves the exact scene and cue; only explicit resume continues", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    for (let i = 0; i < 4; i++) s = sessionTransition(s, { type: "tick" });
    const paused = sessionTransition(s, { type: "pause" });
    expect(paused.state).toBe(s.state);
    expect(paused.shortcut).toBe(s.shortcut);
    expect(sessionTransition(paused, { type: "tick" })).toBe(paused);
    const resumed = sessionTransition(paused, { type: "resume" });
    expect(resumed.step).toBe(paused.step);
    expect(sessionTransition(resumed, { type: "tick" }).step).toBe(paused.step + 1);
  });
  it("replay restarts blank from playing and paused scenes", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    for (const _ of story) s = sessionTransition(s, { type: "tick" });
    for (const mode of ["playing", "paused"] as const) {
      expect(sessionTransition({ ...s, mode }, { type: "replay" })).toEqual({
        ...initialSession(),
        mode: "playing",
        replayVersion: s.replayVersion + 1,
      });
    }
  });
});
