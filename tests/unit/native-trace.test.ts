import { it, expect } from "vitest";
import trace from "../fixtures/native-trace.json";
import { initialState, transition, type Command } from "../../src/demo/model";
it("matches native trace layout and focus, composing send with destination activation", () => {
  let state = initialState();
  const ids = new Map<number, number>();
  const commands: Record<string, Command> = {
    create: { type: "create" },
    "focus-left": { type: "focus", direction: "left" },
    "move-right": { type: "move", direction: "right" },
    "move-up": { type: "move", direction: "up" },
    "send-2": { type: "send", name: "2" },
    "workspace-2": { type: "workspace", name: "2" },
  };
  for (const [index, snapshot] of trace.entries()) {
    // The demo follows transfers by request: native send + the next workspace activation.
    // Keep the original native fixture unchanged, including its source-focus send snapshot.
    const expected = snapshot.label === "send-2" ? trace[index + 1] : snapshot;
    if (snapshot.label !== "empty") state = transition(state, commands[snapshot.label]);
    if (snapshot.label === "create") ids.set(state.focused!, ids.size + 1);
    expect({
      workspace: state.workspace,
      focused: state.focused === null ? null : ids.get(state.focused),
      columns: ["1", "2"].map((name) =>
        state.workspaces
          .find((w) => w.name === name)!
          .columns.map((c) => c.windows.map((w) => ids.get(w.id))),
      ),
    }).toEqual({
      workspace: expected.workspace,
      focused: expected.focused,
      columns: expected.columns,
    });
  }
});
