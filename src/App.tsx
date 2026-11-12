import { useEffect, useEffectEvent, useState } from "react";
import {
  ArrowUpRight,
  Monitor as MonitorIcon,
  PanelsTopLeft,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "@/components/panel";
import { Monitor } from "@/components/monitor";
import { Guide } from "@/components/guide";
import { KeyboardControls, directions, type ActionMode } from "@/components/keyboard-controls";
import { useDemo } from "@/demo/use-demo";
import { describe, workspaceNames, type Command } from "@/demo/model";
import { story } from "@/demo/playback";
import { cn } from "@/lib/utils";
export default function App() {
  const { session, dispatch, region, reduced } = useDemo();
  const { state } = session;
  const [panel, setPanel] = useState<"guide" | "install" | null>(null);
  const [mode, setMode] = useState<ActionMode>("focus");
  const illustrated = session.mode === "playing" ? story[session.step - 1]?.command : undefined;
  const shownMode =
    illustrated &&
    (illustrated.type === "focus" || illustrated.type === "move" || illustrated.type === "resize")
      ? illustrated.type
      : session.mode === "playing"
        ? "focus"
        : mode;
  function act(command: Command) {
    setMode(
      command.type === "focus" || command.type === "move" || command.type === "resize"
        ? command.type
        : shownMode,
    );
    dispatch({ type: "user", command });
  }
  function chooseMode(value: ActionMode) {
    dispatch({ type: "user" });
    setMode(value);
  }
  function openPanel(value: typeof panel) {
    dispatch({ type: "user" });
    setPanel(value);
  }
  function reset() {
    dispatch({ type: "reset" });
    setMode("focus");
  }
  function playback() {
    if (session.mode === "playing") dispatch({ type: "pause" });
    else if (session.mode === "paused") dispatch({ type: "resume" });
    else {
      setMode("focus");
      dispatch({ type: "replay" });
    }
  }
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (
      !region.current?.contains(event.target as Node) ||
      panel !== null ||
      event.defaultPrevented ||
      event.isComposing ||
      (event.target instanceof HTMLElement &&
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
        ))
    )
      return;
    if (event.key === "Escape") {
      (document.activeElement as HTMLElement | null)?.blur();
      event.preventDefault();
      return;
    }
    if (event.metaKey) return;
    // macOS Option changes event.key (e.g. H becomes ˙); code preserves the shortcut key.
    const key = event.altKey
      ? event.code.replace(/^(Key|Digit)/, "").toLowerCase()
      : event.key.toLowerCase();
    let action = shownMode;
    if (event.altKey) {
      if (event.ctrlKey && !event.shiftKey) return;
      action = event.ctrlKey ? "resize" : event.shiftKey ? "move" : "focus";
    } else if (event.ctrlKey) return;
    const direction = directions.find((item) => item.key.toLowerCase() === key)?.direction;
    if (direction) {
      event.preventDefault();
      region.current?.focus({ preventScroll: true });
      act({ type: action, direction });
    } else if (workspaceNames.some((name) => name === key)) {
      if (action === "resize") return;
      event.preventDefault();
      region.current?.focus({ preventScroll: true });
      act({ type: action === "move" ? "send" : "workspace", name: key });
      setMode(action);
    } else if (!event.altKey && (key === "f" || key === "m" || key === "r")) {
      event.preventDefault();
      region.current?.focus({ preventScroll: true });
      chooseMode(key === "f" ? "focus" : key === "m" ? "move" : "resize");
    } else if (!event.altKey && (key === "n" || key === "x")) {
      event.preventDefault();
      region.current?.focus({ preventScroll: true });
      act({ type: key === "n" ? "create" : "close" });
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <a className="skip-link" href="#demo-controls">
        Skip to demo controls
      </a>
      <div className="site-shell">
        <header className="site-header">
          <a className="wordmark" href="/" aria-label="Frame home">
            <img src="/icon.png" width="42" height="42" alt="" />
            <span>Frame</span>
          </a>
          <nav aria-label="Main navigation">
            <a
              href="/guide.html"
              onClick={(event) => {
                event.preventDefault();
                event.currentTarget.focus();
                openPanel("guide");
              }}
            >
              Guide
            </a>
            <a href="https://github.com/tvr-works/frame">
              GitHub <ArrowUpRight />
            </a>
            <Button onClick={() => openPanel("install")}>Install</Button>
          </nav>
        </header>
        <main>
          <div className="intro">
            <h1>Intuitive, keyboard-first window management for macOS.</h1>
          </div>
          <section
            role="application"
            className="demo"
            ref={region}
            aria-label="Interactive Frame demo"
            aria-describedby="demo-keyboard-help"
            tabIndex={-1}
            onPointerUpCapture={(event) => {
              if (
                event.button === 0 &&
                !(
                  event.target instanceof HTMLElement &&
                  event.target.closest(
                    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
                  )
                )
              )
                event.currentTarget.focus({ preventScroll: true });
            }}
          >
            <div className="demo-top-row">
              <div className="open-control">
                <Button variant="outline" onClick={() => act({ type: "create" })}>
                  <Plus />
                  Open window
                </Button>
              </div>
              <div className="display-switch">
                <ToggleGroup
                  value={[String(state.visible.length)]}
                  onValueChange={(value) => {
                    if (value[0]) act({ type: "monitors", count: Number(value[0]) as 1 | 2 });
                  }}
                  aria-label="Display setup"
                >
                  <ToggleGroupItem value="1">
                    <MonitorIcon />
                    Single monitor
                  </ToggleGroupItem>
                  <ToggleGroupItem value="2">
                    <PanelsTopLeft />
                    Dual monitors
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="utility-controls">
                <Button variant="ghost" size="sm" onClick={playback}>
                  {session.mode === "playing" ? <Pause /> : <Play />}
                  {session.mode === "playing"
                    ? "Pause"
                    : session.mode === "paused"
                      ? "Play"
                      : "Replay"}
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw />
                  Reset
                </Button>
              </div>
            </div>
            <div className={cn("demo-stage", state.visible.length === 1 && "stage-single")}>
              <div className="stage-radiance" aria-hidden="true" />
              <div className={cn("monitors", state.visible.length === 1 && "monitors-single")}>
                <Monitor index={0} state={state} act={act} />
                {state.visible.length === 2 ? <Monitor index={1} state={state} act={act} /> : null}
              </div>
            </div>
            <div className="demo-caption">
              <p>{session.caption}</p>
            </div>
            <KeyboardControls
              mode={shownMode}
              state={state}
              onMode={chooseMode}
              onCommand={act}
              illustrated={illustrated}
            />
            <p id="demo-keyboard-help" className="sr-only">
              Click or tab into the demo to use its keyboard controls. Option H/J/K/L focuses; add
              Shift to move or Control and Shift to resize. Option 1–0 switches workspace; add Shift
              to send. Plain H/J/K/L and numbers use the selected action, F/M/R selects
              Focus/Move/Resize, N opens and X closes. Escape releases keyboard focus. Tab moves
              normally.
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {panel === null && session.mode === "manual"
                ? `${mode} mode. ${state.message} ${describe(state)}`
                : session.mode === "complete"
                  ? "Demo complete. You can now control the windows."
                  : session.mode === "paused"
                    ? "Demo paused."
                    : ""}
            </p>
            {reduced ? (
              <span className="sr-only">
                Autoplay is off for your reduced motion preference. Open a window to begin.
              </span>
            ) : null}
          </section>
        </main>
      </div>
      <Panel
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
        title={
          panel === "install" ? "Meet your new workspace." : "A clear path to getting started."
        }
        description={panel === "install" ? "Frame for macOS" : "A quick guide to Frame."}
      >
        <Guide install={panel === "install"} />
      </Panel>
    </>
  );
}
