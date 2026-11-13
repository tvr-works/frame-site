import { Monitor as MonitorIcon, Globe, NotebookPen, Code2 } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { layout, surface, windowTitles, type DemoState } from "@/demo/model";
import { WindowContent } from "./window-content";
import { WorkspaceBank } from "./workspace-bank";
import type { ShortcutCue } from "@/demo/playback";
const icons = { browser: Globe, notes: NotebookPen, editor: Code2 };
export function Monitor({
  index,
  state,
  closingWindow,
  shortcut,
}: {
  index: number;
  state: DemoState;
  closingWindow?: number;
  shortcut?: ShortcutCue;
}) {
  const ws = state.workspaces.find((w) => w.name === state.visible[index])!;
  const active = state.workspace === ws.name;
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
            <span className="desktop-label">
              <MonitorIcon /> <span>Display {index + 1}</span>
              <span>·</span>
              <span>Workspace {ws.name}</span>
            </span>
          </div>
          <div className="desktop-workarea">
            {layout(ws).map(({ window: win, x, y, width, height }) => {
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
                    <div className="traffic-lights">
                      <span
                        className="window-close"
                        data-cued={closingWindow === win.id || undefined}
                      />
                      <i />
                      <i />
                    </div>
                    <div className="window-focus">
                      <Icon />
                      <span>{windowTitles[win.kind]}</span>
                    </div>
                  </div>
                  <div className="window-body">
                    <div className="window-preview">
                      <WindowContent kind={win.kind} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <WorkspaceBank
        names={state.workspaces
          .filter((workspace) => workspace.monitor === index)
          .map((workspace) => workspace.name)}
        activeWorkspace={state.workspace}
        litKey={shortcut?.key}
      />
    </div>
  );
}
