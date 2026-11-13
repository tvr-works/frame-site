import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
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
export function KeyboardShortcuts({ shortcut }: { shortcut?: ShortcutCue }) {
  return (
    <div className="keyboard-controls" aria-hidden="true">
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
              className="shortcut-key direction-key"
              data-lit={shortcut?.key === key || undefined}
            >
              <kbd>{key}</kbd>
              <Icon />
            </span>
          ))}
        </div>
      </div>
      <ActiveShortcut shortcut={shortcut} />
    </div>
  );
}

function ActiveShortcut({ shortcut }: { shortcut?: ShortcutCue }) {
  const mode = modes.find((item) => item.value === shortcut?.mode);
  const direction = directions.find((item) => item.key === shortcut?.key);
  const Icon = direction?.Icon;
  return (
    <div className="active-shortcut">
      {mode && shortcut?.key ? (
        <>
          <span className="active-modifiers">
            {mode.keys.map((key) => (
              <kbd key={key} data-lit="true">
                {key}
              </kbd>
            ))}
          </span>
          <span className="active-join">+</span>
          <span className="active-target">
            <kbd className="shortcut-key active-key" data-lit="true">
              {shortcut.key}
            </kbd>
            {Icon ? <Icon /> : null}
          </span>
        </>
      ) : null}
    </div>
  );
}
