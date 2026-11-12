import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
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
import { Learn } from "@/components/learn";
import { KeyboardControls, directions, type ActionMode } from "@/components/keyboard-controls";
import { useDemo } from "@/demo/use-demo";
import { describe, workspaceNames, type Command } from "@/demo/model";
import { story } from "@/demo/playback";
import { cn } from "@/lib/utils";
export default function App() {
  const { session, dispatch, region, reduced } = useDemo();
  const { state } = session;
  const [panel, setPanel] = useState<"learn" | "guide" | "install" | null>(null);
  const [lesson, setLesson] = useState(0),
    [mode, setMode] = useState<ActionMode>("focus"),
    [keyboard, setKeyboard] = useState(false);
  const practice = useRef<HTMLTextAreaElement>(null),
    learnTrigger = useRef<HTMLButtonElement>(null);
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
    setKeyboard(false);
    setPanel(value);
  }
  function reset() {
    dispatch({ type: "reset" });
    setLesson(0);
    setMode("focus");
    setKeyboard(false);
  }
  function playback() {
    if (session.mode === "playing") dispatch({ type: "pause" });
    else if (session.mode === "paused") dispatch({ type: "resume" });
    else {
      setMode("focus");
      dispatch({ type: "replay" });
    }
  }
  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!keyboard || event.target !== event.currentTarget) return;
    if (event.key === "Escape") {
      setKeyboard(false);
      learnTrigger.current?.focus();
      event.preventDefault();
      return;
    }
    // Global native/OS shortcuts must never become demo keyboard bindings.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase(),
      direction = directions.find((item) => item.key.toLowerCase() === key)?.direction;
    if (direction) {
      event.preventDefault();
      act({ type: mode, direction });
    } else if (key === "f" || key === "m" || key === "r") {
      event.preventDefault();
      chooseMode(key === "f" ? "focus" : key === "m" ? "move" : "resize");
    } else if (key === "n" || key === "x") {
      event.preventDefault();
      act({ type: key === "n" ? "create" : "close" });
    } else if (workspaceNames.some((name) => name === key)) {
      event.preventDefault();
      if (mode !== "resize") act({ type: mode === "move" ? "send" : "workspace", name: key });
    }
  }
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
          <section className="demo" ref={region} aria-label="Interactive Frame demo">
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
                <Button
                  variant="ghost"
                  size="sm"
                  ref={learnTrigger}
                  aria-haspopup="dialog"
                  onClick={() => openPanel("learn")}
                >
                  <BookOpen />
                  Learn
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
            {keyboard ? (
              <div className="keyboard-help">
                <p id="browser-practice-help">
                  <strong>Browser practice · {mode} mode.</strong> Plain F/M/R chooses the action;
                  H/J/K/L applies a direction. N opens, X closes. Numbers switch in Focus mode and
                  send in Move mode. Escape exits; Tab leaves normally.
                </p>
                <label className="keyboard-practice-label">
                  Practice uses plain keys, separately from Frame’s native Option shortcuts.
                  <textarea
                    ref={practice}
                    className="keyboard-surface"
                    aria-label="Keyboard practice area"
                    aria-describedby="browser-practice-help"
                    onKeyDown={onKey}
                    onBlur={() => setKeyboard(false)}
                    readOnly
                    rows={1}
                    value="F / M / R · H / J / K / L · N / X · Escape exits"
                  />
                </label>
              </div>
            ) : null}
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
        finalFocus={keyboard ? practice : undefined}
        title={
          panel === "install"
            ? "Meet your new workspace."
            : panel === "guide"
              ? "A clear path to getting started."
              : "Keep your hands in the flow."
        }
        description={
          panel === "learn"
            ? "One home row. Add modifiers to change what it does."
            : panel === "install"
              ? "Frame for macOS"
              : "A quick guide to Frame."
        }
      >
        {panel === "learn" ? (
          <Learn
            lesson={lesson}
            onLesson={setLesson}
            onCommand={act}
            onPractice={() => {
              setKeyboard(true);
              setPanel(null);
            }}
            message={state.message}
          />
        ) : (
          <Guide install={panel === "install"} />
        )}
      </Panel>
    </>
  );
}
