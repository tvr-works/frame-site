import { Monitor as MonitorIcon, Globe, NotebookPen, Code2, Terminal, X } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { layout, surface, windowTitles, type DemoState, type Command } from "@/demo/model";
import { WindowContent } from "./window-content";
const icons = { browser: Globe, notes: NotebookPen, editor: Code2, terminal: Terminal };
export function Monitor({
  index,
  state,
  act,
}: {
  index: number;
  state: DemoState;
  act: (command: Command) => void;
}) {
  const ws = state.workspaces.find((w) => w.name === state.visible[index])!;
  const active = state.workspace === ws.name;
  const windows = layout(ws);
  return (
    <div className="monitor" data-testid={`monitor-${index}`}>
      <div className="monitor-shell">
        <img
          className="monitor-frame"
          src="/monitor-shell.webp"
          width="1400"
          height="960"
          alt=""
          draggable={false}
        />
        <div className="monitor-screen">
          <div className="desktop-menu">
            <button
              onClick={() => act({ type: "monitor", index })}
              aria-label={`Focus display ${index + 1}, workspace ${ws.name}`}
            >
              <MonitorIcon /> <span>Display {index + 1}</span>
            </button>
            <span>Workspace {ws.name}</span>
            <img src="/icon.png" width="16" height="16" alt="Frame" />
          </div>
          <div
            className="desktop-workarea"
            aria-label={`Display ${index + 1}, workspace ${ws.name}`}
          >
            {windows.length === 0 ? (
              <button
                className="empty-desktop"
                onClick={() => {
                  act({ type: "monitor", index });
                  act({ type: "create" });
                }}
              >
                <span>Room for your next idea.</span>
                <span className="empty-action">
                  Open a window <span aria-hidden="true">↗</span>
                </span>
              </button>
            ) : null}
            {windows.map(({ window: win, x, y, width, height }) => {
              const Icon = icons[win.kind];
              const focused = state.focused === win.id && active;
              return (
                <div
                  className={cn("demo-window", focused && "window-focused")}
                  key={win.id}
                  data-window-id={win.id}
                  data-kind={win.kind}
                  data-focused={focused}
                  style={
                    {
                      "--x": `${(x / surface.width) * 100}%`,
                      "--y": `${(y / surface.height) * 100}%`,
                      "--w": `${(width / surface.width) * 100}%`,
                      "--h": `${(height / surface.height) * 100}%`,
                    } as CSSProperties
                  }
                >
                  <div className="window-titlebar">
                    <button
                      className="window-focus"
                      onClick={() => act({ type: "select", id: win.id })}
                      aria-label={`Focus ${windowTitles[win.kind]} window ${win.id}`}
                      aria-pressed={focused}
                    >
                      <span className="traffic-lights" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <Icon />
                      <span>{windowTitles[win.kind]}</span>
                    </button>
                    <button
                      className="window-close"
                      aria-label={`Close ${windowTitles[win.kind]} window ${win.id}`}
                      onClick={() => {
                        act({ type: "select", id: win.id });
                        act({ type: "close" });
                      }}
                    >
                      <X />
                    </button>
                  </div>
                  <div className="window-body">
                    <div className="window-preview" aria-hidden="true">
                      <WindowContent kind={win.kind} />
                    </div>
                    <button
                      className="window-surface-button"
                      tabIndex={-1}
                      aria-label={`Focus ${windowTitles[win.kind]} window ${win.id}`}
                      onClick={() => act({ type: "select", id: win.id })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
