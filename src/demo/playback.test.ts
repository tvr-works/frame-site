import { describe, it, expect } from "vitest";
import { initialSession, sessionTransition, story } from "./playback";
describe("autoplay ownership", () => {
  it("starts blank, advances through the same model, and stops after one play", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    expect(s.state.focused).toBeNull();
    for (const _ of story) s = sessionTransition(s, { type: "tick" });
    expect(s.mode).toBe("complete");
    expect(s.state.workspaces.flatMap((w) => w.columns.flatMap((c) => c.windows))).toHaveLength(4);
    expect(sessionTransition(s, { type: "tick" })).toEqual(s);
  });
  it("takes over exact current state, including when a visitor only selects an action mode", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    s = sessionTransition(s, { type: "tick" });
    s = sessionTransition(s, { type: "tick" });
    const before = s.state;
    s = sessionTransition(s, { type: "user" });
    expect(s.mode).toBe("manual");
    expect(s.state).toBe(before);
    expect(sessionTransition(s, { type: "tick" }).state).toBe(before);
    expect(sessionTransition(s, { type: "resume" }).mode).toBe("manual");
  });
  it("the first action applies to the existing layout without replay/reset", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    s = sessionTransition(s, { type: "tick" });
    const id = s.state.focused;
    s = sessionTransition(s, { type: "user", command: { type: "create" } });
    expect(s.state.workspaces[0].columns[0].windows[0].id).toBe(id);
    expect(s.mode).toBe("manual");
  });
  it("pause is stable; only explicit resume continues from the same step", () => {
    let s = sessionTransition(initialSession(), { type: "resume" });
    s = sessionTransition(s, { type: "tick" });
    const paused = sessionTransition(s, { type: "pause" });
    expect(sessionTransition(paused, { type: "tick" })).toEqual(paused);
    expect(sessionTransition(paused, { type: "resume" }).step).toBe(1);
  });
  it("reset clears windows, keeps monitor setup, stays manual; replay explicitly starts blank", () => {
    let s = sessionTransition(initialSession(), {
      type: "user",
      command: { type: "monitors", count: 1 },
    });
    s = sessionTransition(s, { type: "user", command: { type: "create" } });
    const reset = sessionTransition(s, { type: "reset" });
    expect(reset.mode).toBe("manual");
    expect(reset.state.visible).toHaveLength(1);
    expect(reset.state.focused).toBeNull();
    const replay = sessionTransition(s, { type: "replay" });
    expect(replay.mode).toBe("playing");
    expect(replay.state.focused).toBeNull();
    expect(replay.step).toBe(0);
  });
});
