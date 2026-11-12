import { it, expect } from "vitest";
import trace from "../fixtures/native-trace.json";
import { initialState, transition, type Command } from "../../src/demo/model";
it("matches each snapshot exported by the native FrameEngine command trace", () => {
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
  for (const snapshot of trace) {
    if (snapshot.label !== "empty") state = transition(state, commands[snapshot.label]);
    if (snapshot.label === "create") ids.set(state.focused!, ids.size + 1);
    expect({
      label: snapshot.label,
      workspace: state.workspace,
      focused: state.focused === null ? null : ids.get(state.focused),
      columns: ["1", "2"].map((name) =>
        state.workspaces
          .find((w) => w.name === name)!
          .columns.map((c) => c.windows.map((w) => ids.get(w.id))),
      ),
    }).toEqual(snapshot);
  }
});
