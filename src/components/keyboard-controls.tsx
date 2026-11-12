import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { workspaceNames, type Command, type DemoState, type Direction } from "@/demo/model";
export interface HeldKeys {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  keys: string[];
}
export type ActionMode = "focus" | "move" | "resize";
export const modes: { value: ActionMode; label: string; keys: string[]; spoken: string }[] = [
  { value: "focus", label: "Focus", keys: ["⌥"], spoken: "Option" },
  { value: "move", label: "Move", keys: ["⌥", "⇧"], spoken: "Option Shift" },
  { value: "resize", label: "Resize", keys: ["⌥", "⇧", "⌃"], spoken: "Option Shift Control" },
];
export const directions: { key: string; direction: Direction; Icon: typeof ArrowLeft }[] = [
  { key: "H", direction: "left", Icon: ArrowLeft },
  { key: "J", direction: "down", Icon: ArrowDown },
  { key: "K", direction: "up", Icon: ArrowUp },
  { key: "L", direction: "right", Icon: ArrowRight },
];
export function KeyboardControls({
  mode,
  state,
  onMode,
  onCommand,
  illustrated,
  held,
  heldMode,
}: {
  mode: ActionMode;
  state: DemoState;
  onMode: (mode: ActionMode) => void;
  onCommand: (command: Command) => void;
  illustrated?: Command;
  held: HeldKeys;
  heldMode?: ActionMode;
}) {
  const workspaceAction = mode === "focus" ? "workspace" : mode === "move" ? "send" : null;
  function bank(names: readonly string[]) {
    return (
      <div className="number-bank">
        {names.map((name) => (
          <Button
            key={name}
            variant="number"
            disabled={
              workspaceAction === null || (workspaceAction === "send" && state.focused === null)
            }
            aria-label={`${workspaceAction === "send" ? "Send to" : "Switch to"} workspace ${name} · ${workspaceAction === "send" ? "Option Shift" : "Option"} ${name}`}
            aria-pressed={workspaceAction === "workspace" ? state.workspace === name : undefined}
            data-illustrated={
              (illustrated &&
                (illustrated.type === "workspace" || illustrated.type === "send") &&
                illustrated.name === name) ||
              undefined
            }
            onClick={() => {
              if (workspaceAction) onCommand({ type: workspaceAction, name });
            }}
          >
            <kbd>{name}</kbd>
          </Button>
        ))}
      </div>
    );
  }
  return (
    <div id="demo-controls" className="keyboard-controls">
      <h2 className="sr-only">Try Frame’s keyboard shortcuts</h2>
      <fieldset className="workspace-keys">
        <legend className="sr-only">Workspace shortcuts</legend>
        {bank(workspaceNames.slice(0, 5))}
        {bank(workspaceNames.slice(5))}
      </fieldset>
      <div className="keyboard-composition">
        <ToggleGroup
          appearance="ladder"
          value={[mode]}
          orientation="vertical"
          onValueChange={(value) => {
            onMode((value[0] ?? mode) as ActionMode);
          }}
          aria-label="Window action"
        >
          {modes.map((item) => (
            <ToggleGroupItem
              value={item.value}
              key={item.value}
              aria-label={`${item.label} · ${item.spoken}`}
            >
              <span className="mode-label">{item.label}</span>
              <span className="modifier-chord" aria-hidden="true">
                {item.keys.map((key) => (
                  <kbd key={key} data-held={item.value === heldMode || undefined}>
                    {key}
                  </kbd>
                ))}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="composition-join" aria-hidden="true">
          <ArrowRight />
        </div>
        <div className="home-row" aria-label={`${mode} directions`}>
          {directions.map(({ key, direction, Icon }) => (
            <Button
              key={key}
              variant="home"
              data-held={held.keys.includes(key) || undefined}
              aria-label={`${mode} ${direction} · ${modes.find((item) => item.value === mode)!.spoken} ${key}`}
              data-illustrated={
                (illustrated &&
                  (illustrated.type === "focus" ||
                    illustrated.type === "move" ||
                    illustrated.type === "resize") &&
                  illustrated.direction === direction) ||
                undefined
              }
              onClick={() => onCommand({ type: mode, direction })}
            >
              <kbd>{key}</kbd>
              <Icon aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
