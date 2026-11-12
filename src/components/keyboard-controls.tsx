import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { workspaceNames, type DemoState } from "@/demo/model";
import type { ShortcutCue, ShortcutMode } from "@/demo/playback";
const modes: { value: ShortcutMode; label: string; keys: string[] }[] = [
  { value: "focus", label: "Focus", keys: ["⌥"] },
  { value: "move", label: "Move", keys: ["⌥", "⇧"] },
  { value: "resize", label: "Resize", keys: ["⌥", "⇧", "⌃"] },
];
const directions = [
  { key: "H", Icon: ArrowLeft },
  { key: "J", Icon: ArrowDown },
  { key: "K", Icon: ArrowUp },
  { key: "L", Icon: ArrowRight },
];
export function KeyboardShortcuts({
  state,
  shortcut,
}: {
  state: DemoState;
  shortcut?: ShortcutCue;
}) {
  function bank(names: readonly string[]) {
    return (
      <div className="number-bank">
        {names.map((name) => (
          <span
            key={name}
            className="shortcut-key button-number"
            data-active={state.workspace === name || undefined}
            data-lit={shortcut?.key === name || undefined}
          >
            <kbd>{name}</kbd>
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="keyboard-controls" aria-hidden="true">
      <div className="workspace-keys">
        {bank(workspaceNames.slice(0, 5))}
        {bank(workspaceNames.slice(5))}
      </div>
      <div className="keyboard-composition">
        <div className="toggle-ladder">
          {modes.map((item) => (
            <div
              className="shortcut-row"
              key={item.value}
              data-mode={item.value}
              data-active={shortcut?.mode === item.value || undefined}
            >
              <span className="mode-label">{item.label}</span>
              <span className="modifier-chord">
                {item.keys.map((key) => (
                  <kbd key={key} data-lit={shortcut?.mode === item.value || undefined}>
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="composition-join">
          <ArrowRight />
        </div>
        <div className="home-row">
          {directions.map(({ key, Icon }) => (
            <span
              key={key}
              className="shortcut-key button-home"
              data-lit={shortcut?.key === key || undefined}
            >
              <kbd>{key}</kbd>
              <Icon />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
