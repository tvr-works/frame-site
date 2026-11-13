import { describe, it, expect } from "vitest";
import {
  initialState,
  transition,
  currentWorkspace,
  layout,
  workspaceNames,
  type DemoState,
  type Command,
} from "./model";
function seed(columns: number[][], focused = columns[0]?.[0] ?? null): DemoState {
  const s = initialState();
  s.nextId = 100;
  s.focused = focused;
  s.clock = 10;
  s.workspaces[0].columns = columns.map((ids, i) => ({
    id: 50 + i,
    recent: i + 1,
    weight: 1424 / columns.length,
    windows: ids.map((id) => ({ id, kind: "browser", weight: 883 / ids.length, recent: id })),
  }));
  return s;
}
const columns = (s: DemoState) =>
  currentWorkspace(s).columns.map((c) => c.windows.map((w) => w.id));
const run = (s: DemoState, ...commands: Command[]) => commands.reduce(transition, s);
describe("FrameEngine fixture parity — source commit 88c47e8", () => {
  it("MoveCommandTest.testMove_rightToAdjacentColumn + emptyColumnRemovedAfterMove", () => {
    const s = transition(seed([[1], [2]], 1), { type: "move", direction: "right" });
    expect(columns(s)).toEqual([[2, 1]]);
    expect(s.focused).toBe(1);
  });
  it("MoveCommandTest.testMove_leftToAdjacentColumn", () =>
    expect(columns(transition(seed([[1], [2]], 2), { type: "move", direction: "left" }))).toEqual([
      [1, 2],
    ]));
  it("MoveCommandTest.testMove_rightAtEdge_createsImplicitColumn", () =>
    expect(columns(transition(seed([[1, 2]], 1), { type: "move", direction: "right" }))).toEqual([
      [2],
      [1],
    ]));
  it("MoveCommandTest.testMove_leftAtEdge_createsImplicitColumn", () =>
    expect(columns(transition(seed([[1, 2]], 1), { type: "move", direction: "left" }))).toEqual([
      [1],
      [2],
    ]));
  it("MoveCommandTest vertical reorder and edge stop", () => {
    expect(columns(transition(seed([[1, 2]], 1), { type: "move", direction: "down" }))).toEqual([
      [2, 1],
    ]);
    expect(columns(transition(seed([[1, 2]], 2), { type: "move", direction: "up" }))).toEqual([
      [2, 1],
    ]);
    expect(columns(transition(seed([[1, 2]], 2), { type: "move", direction: "down" }))).toEqual([
      [1, 2],
    ]);
    expect(columns(transition(seed([[1, 2]], 1), { type: "move", direction: "up" }))).toEqual([
      [1, 2],
    ]);
  });
  it("FocusCommandTest.testFocusFindMruLeaf: adjacent column uses MRU, not row alignment", () => {
    const initial = seed([[1], [2, 5, 3]], 1);
    initial.workspaces[0].columns[1].windows[1].recent = 20;
    const s = transition(initial, { type: "focus", direction: "right" });
    expect(s.focused).toBe(5);
    expect(columns(s)).toEqual([[1], [2, 5, 3]]);
  });
  it("FocusCommandTest.testFocusNoWrapping / default workspace boundary", () => {
    const s = initialState();
    s.workspaces[0] = seed([[1]], 1).workspaces[0];
    s.focused = 1;
    expect(transition(s, { type: "focus", direction: "right" }).workspace).toBe("1");
    expect(transition(s, { type: "focus", direction: "left" }).focused).toBe(1);
  });
  it("WindowRegistrationTest: landscape second column, then focused-column placement", () => {
    const s = run(
      initialState(),
      { type: "create" },
      { type: "create" },
      { type: "focus", direction: "left" },
      { type: "create" },
    );
    expect(columns(s)).toEqual([[2, 5], [4]]);
    expect(s.focused).toBe(5);
  });
  it("ResizeBehaviorTest: last-column flip, +/-50 and sibling redistribution", () => {
    const a = transition(seed([[1], [2]], 1), { type: "resize", direction: "right" });
    const b = transition(seed([[1], [2]], 2), { type: "resize", direction: "right" });
    expect(a.workspaces[0].columns.map((c) => c.weight)).toEqual([762, 662]);
    expect(b.workspaces[0].columns.map((c) => c.weight)).toEqual([762, 662]);
    expect(
      transition(a, { type: "resize", direction: "left" }).workspaces[0].columns.map(
        (c) => c.weight,
      ),
    ).toEqual([712, 712]);
  });
  it("ResizeBehaviorTest: height flip and single-column no-op", () => {
    const a = transition(seed([[1, 2]], 2), { type: "resize", direction: "down" });
    expect(a.workspaces[0].columns[0].windows.map((w) => w.weight)).toEqual([491.5, 391.5]);
    const s = seed([[1]], 1);
    expect(columns(transition(s, { type: "resize", direction: "right" }))).toEqual([[1]]);
    expect(
      transition(s, { type: "resize", direction: "right" }).workspaces[0].columns[0].weight,
    ).toBe(1424);
  });
  it("transfers append to last column, independently of automatic new-window placement", () => {
    const s = seed([[1]], 1);
    s.workspaces[1].columns = seed([[2], [3]]).workspaces[0].columns;
    const result = transition(s, { type: "send", name: "2" });
    expect(result.workspaces[1].columns.map((c) => c.windows.map((w) => w.id))).toEqual([
      [2],
      [3, 1],
    ]);
  });
});
describe("browser demo bounds and state invariants", () => {
  it("does not mutate caller state", () => {
    const s = initialState();
    const before = structuredClone(s);
    transition(s, { type: "create" });
    expect(s).toEqual(before);
  });
  it("locks every workspace to its number bank and activates its remembered focus", () => {
    let s = initialState();
    expect(s.visible).toEqual(["1", "6"]);
    for (const [index, name] of workspaceNames.entries()) {
      const monitor = index < 5 ? 0 : 1;
      const other = s.visible[1 - monitor];
      s = transition(s, { type: "workspace", name });
      expect(s.workspace).toBe(name);
      expect(s.visible[monitor]).toBe(name);
      expect(s.visible[1 - monitor]).toBe(other);
      expect(currentWorkspace(s).monitor).toBe(monitor);
      expect(s.focused).toBeNull();
      s = run(s, { type: "create" }, { type: "create" }, { type: "focus", direction: "left" });
      const focused = s.focused;
      s = run(
        s,
        { type: "workspace", name: monitor === 0 ? "6" : "1" },
        { type: "workspace", name },
      );
      expect(s.focused).toBe(focused);
    }
  });
  it.each([
    { name: "3", visible: ["3", "6"] },
    { name: "6", visible: ["1", "6"] },
    { name: "0", visible: ["1", "0"] },
  ] as const)(
    "follows a transferred window to workspace $name on its assigned display",
    ({ name, visible }) => {
      const source = run(initialState(), { type: "create" }, { type: "create" });
      const sent = source.focused;
      const s = transition(source, { type: "send", name });
      expect(s.visible).toEqual(visible);
      expect(s.workspace).toBe(name);
      expect(s.focused).toBe(sent);
      expect(
        currentWorkspace(s)
          .columns.flatMap((c) => c.windows)
          .map((w) => w.id),
      ).toContain(sent);
      expect(s.workspaces[0].columns.flatMap((c) => c.windows).map((w) => w.id)).not.toContain(
        sent,
      );
      const returned = transition(s, { type: "workspace", name: "1" });
      expect(returned.focused).toBe(2);
    },
  );
  it("keeps the moved window focused instead of the destination's previously active window", () => {
    let s = run(initialState(), { type: "create" });
    const moved = s.focused;
    s = run(s, { type: "workspace", name: "6" }, { type: "create" }, { type: "create" });
    const previousDestination = s.focused;
    s = run(s, { type: "workspace", name: "1" }, { type: "send", name: "6" });
    expect(s.workspace).toBe("6");
    expect(s.focused).toBe(moved);
    expect(s.focused).not.toBe(previousDestination);
    expect(currentWorkspace(s).columns.at(-1)?.windows.at(-1)?.id).toBe(moved);
  });
  it("rejected transfers preserve source focus, visibility and all windows", () => {
    let source = run(initialState(), { type: "create" }, { type: "workspace", name: "6" });
    for (let i = 0; i < 6; i++) source = transition(source, { type: "create" });
    source = transition(source, { type: "workspace", name: "1" });
    for (const name of ["1", "6", "missing"]) {
      const s = transition(source, { type: "send", name });
      expect(s).toEqual(source);
    }
    const empty = initialState();
    expect(transition(empty, { type: "send", name: "0" }).focused).toBeNull();
  });
  it("closing the last focused window leaves an empty workspace", () => {
    const source = run(initialState(), { type: "workspace", name: "6" }, { type: "create" });
    const closed = transition(source, { type: "close" });
    expect(closed.focused).toBeNull();
    expect(closed.workspace).toBe("6");
    expect(closed.visible).toEqual(["1", "6"]);
    expect(columns(closed)).toEqual([]);
  });
  it("keeps Frame’s 8-point outer/inner gaps and one-point height correction", () => {
    const s = seed([[1], [2, 3]], 1),
      rects = layout(s.workspaces[0]);
    expect(rects[0]).toMatchObject({ x: 8, y: 8, width: 708, height: 883 });
    expect(rects[1]).toMatchObject({ x: 724, y: 8, width: 708, height: 437.5 });
    expect(rects[2].y).toBe(453.5);
  });
  it("enforces documented demo limits without losing windows or allowing negative sizes", () => {
    let s = initialState();
    for (let i = 0; i < 7; i++) s = transition(s, { type: "create" });
    expect(s.workspaces[0].columns.flatMap((c) => c.windows)).toHaveLength(6);
    for (let i = 0; i < 100; i++) s = transition(s, { type: "resize", direction: "left" });
    expect(layout(s.workspaces[0]).every((r) => r.width > 0 && r.height > 0)).toBe(true);
  });
  it("mixed deterministic action trace preserves unique windows, normalized visible extents and valid focus", () => {
    let s = initialState();
    const commands: Command[] = [
      { type: "create" },
      { type: "create" },
      { type: "focus", direction: "left" },
      { type: "create" },
      { type: "move", direction: "right" },
      { type: "move", direction: "down" },
      { type: "resize", direction: "up" },
      { type: "send", name: "2" },
      { type: "workspace", name: "2" },
      { type: "create" },
      { type: "close" },
    ];
    for (const command of commands) {
      s = transition(s, command);
      const ids = s.workspaces.flatMap((w) => w.columns.flatMap((c) => c.windows.map((x) => x.id)));
      expect(new Set(ids).size).toBe(ids.length);
      if (s.focused !== null)
        expect(currentWorkspace(s).columns.flatMap((c) => c.windows.map((x) => x.id))).toContain(
          s.focused,
        );
      for (const w of s.workspaces.filter((w) => s.visible.includes(w.name)))
        if (w.columns.length) expect(w.columns.reduce((a, c) => a + c.weight, 0)).toBeCloseTo(1424);
    }
  });
});
