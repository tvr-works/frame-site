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
  it("cues modifiers before each action, then demonstrates focus, move, resize and follow-focus transfer", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    for (const beat of story) {
      const before = s;
      s = sessionTransition(s, { type: "tick" });
      if (beat.shortcut && !beat.command) {
        expect(s.state).toBe(before.state);
        expect(s.shortcut?.key).toBeUndefined();
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
      });
    }
  });
});
