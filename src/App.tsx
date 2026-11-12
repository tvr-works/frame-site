import { useState, type MouseEvent } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/panel";
import { Monitor } from "@/components/monitor";
import { Guide } from "@/components/guide";
import { BelowFold } from "@/components/below-fold";
import { KeyboardShortcuts } from "@/components/keyboard-controls";
import { useDemo } from "@/demo/use-demo";
import { describe } from "@/demo/model";
export default function App() {
  const { session, dispatch, region, reduced } = useDemo();
  const { state } = session;
  const [panel, setPanel] = useState<"guide" | "install" | null>(null);
  function openPanel(value: typeof panel) {
    dispatch({ type: "pause" });
    setPanel(value);
  }
  function openGuide(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.currentTarget.focus();
    openPanel("guide");
  }
  function playback() {
    dispatch({ type: session.mode === "playing" ? "pause" : "resume" });
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
            <a href="/guide.html" onClick={openGuide}>
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
            <p className="intro-eyebrow">Keyboard-first · Vim-inspired</p>
            <h1>Tiling Window Manager for macOS</h1>
          </div>
          <section
            className="demo"
            ref={region}
            aria-label="Frame shortcut demonstration"
            aria-describedby="demo-description"
            data-playback={session.mode}
            data-step={session.step}
          >
            <p id="demo-description" className="sr-only">
              A scripted demonstration opens three windows on the left display. Option H, J, K and L
              change focus without moving windows. Adding Shift to Option L moves the focused window
              right; adding Control resizes the column width or a row’s height in steps. Option
              Shift 7 sends it to workspace 7 on the right display, then Option Shift 1 brings it
              back to the left, keeping it focused both ways. The action label, illustrated keys and
              window change appear together, then pause before the next step. Each window’s red
              close dot lights up before it closes, then the demo repeats from empty monitors. Use
              Play or Pause to control playback, or Replay to start again.
            </p>
            <div id="demo-stage" className="demo-stage">
              <div className="stage-radiance" aria-hidden="true" />
              <div className="monitors" aria-hidden="true">
                <Monitor index={0} state={state} closingWindow={session.closingWindow} />
                <Monitor index={1} state={state} closingWindow={session.closingWindow} />
              </div>
              <p className="demo-action-label">{session.caption}</p>
              <div id="demo-controls" className="utility-controls" tabIndex={-1}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playback}
                  aria-label={session.mode === "playing" ? "Pause" : "Play"}
                  title={session.mode === "playing" ? "Pause demonstration" : "Play demonstration"}
                  aria-controls="demo-stage"
                >
                  {session.mode === "playing" ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch({ type: "replay" })}
                  aria-label="Replay"
                  title="Replay demonstration"
                  aria-controls="demo-stage"
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
              </div>
            </div>
            <KeyboardShortcuts state={state} shortcut={session.shortcut} />
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {session.mode === "paused"
                ? `Demo paused. ${session.caption} ${describe(state)}`
                : ""}
            </p>
            {reduced ? (
              <span className="sr-only">
                Autoplay is off for your reduced motion preference. Select Play to watch the demo.
              </span>
            ) : null}
          </section>
          <BelowFold />
        </main>
        <footer className="site-footer">
          <nav aria-label="Footer navigation">
            <a href="/guide.html" onClick={openGuide}>
              Guide
            </a>
            <a href="https://github.com/tvr-works/frame">
              GitHub <ArrowUpRight />
            </a>
          </nav>
        </footer>
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
