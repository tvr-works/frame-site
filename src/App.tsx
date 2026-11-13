import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Monitor } from "@/components/monitor";
import { InstallSection } from "@/components/install";
import { SiteHeader, SiteFooter } from "@/components/site-navigation";
import { BelowFold } from "@/components/below-fold";
import { KeyboardShortcuts } from "@/components/keyboard-controls";
import { useDemo } from "@/demo/use-demo";
import { describe } from "@/demo/model";
export default function App() {
  const { session, dispatch, region, reduced } = useDemo();
  const { state } = session;
  function playback() {
    dispatch({ type: session.mode === "playing" ? "pause" : "resume" });
  }
  return (
    <>
      <a className="skip-link" href="#demo-controls">
        Skip to demo controls
      </a>
      <div className="site-shell">
        <SiteHeader />
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
                <Monitor
                  index={0}
                  state={state}
                  closingWindow={session.closingWindow}
                  shortcut={session.shortcut}
                />
                <Monitor
                  index={1}
                  state={state}
                  closingWindow={session.closingWindow}
                  shortcut={session.shortcut}
                />
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
            <KeyboardShortcuts shortcut={session.shortcut} />
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
          <InstallSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
