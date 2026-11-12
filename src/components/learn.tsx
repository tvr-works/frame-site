import { ArrowRight, Keyboard } from "lucide-react";
import { Button } from "./ui/button";
import { directions, modes } from "./keyboard-controls";
import type { Command } from "@/demo/model";
const lessons = [
  {
    title: "Start with a clear desktop",
    body: "Open two windows. The second creates a new column on a landscape display.",
    command: { type: "create" } as Command,
    action: "Open a window",
  },
  {
    title: "Change your point of focus",
    body: "Focus left. The active outline changes; the windows stay in place.",
    command: { type: "focus", direction: "left" } as Command,
    action: "Focus left · ⌥ H",
  },
  {
    title: "Make space for another idea",
    body: "Open another window. It joins the focused column, below the window already there.",
    command: { type: "create" } as Command,
    action: "Open a window",
  },
  {
    title: "Bring your windows together",
    body: "Move right to push the focused window into its neighboring column. Move at an outer edge to create a column.",
    command: { type: "move", direction: "right" } as Command,
    action: "Move right · ⌥ ⇧ L",
  },
  {
    title: "Give the boundary a nudge",
    body: "Resize right moves the active column boundary by 50 points. The last column uses its left edge.",
    command: { type: "resize", direction: "right" } as Command,
    action: "Resize right · ⌃ ⇧ ⌥ L",
  },
  {
    title: "A different workspace, the same flow",
    body: "Send the focused window to workspace 6. Your focus stays here. Switch workspace to follow it.",
    command: { type: "send", name: "6" } as Command,
    action: "Send to workspace 6 · ⌥ ⇧ 6",
  },
];

export function Learn({
  lesson,
  onLesson,
  onCommand,
  onPractice,
  message,
}: {
  lesson: number;
  onLesson: (lesson: number) => void;
  onCommand: (command: Command) => void;
  onPractice: () => void;
  message: string;
}) {
  return (
    <div className="learn-content">
      <p className="learn-intro">
        Choose a modifier combination, then click H, J, K or L. The same directions work for focus,
        movement and resizing.
      </p>
      <section className="lesson">
        <span className="eyebrow">
          LEARN BY DOING · {lesson + 1} / {lessons.length}
        </span>
        <h3>{lessons[lesson].title}</h3>
        <p>{lessons[lesson].body}</p>
        <div className="lesson-actions">
          <Button variant="outline" onClick={() => onCommand(lessons[lesson].command)}>
            {lessons[lesson].action}
          </Button>
          <Button variant="ghost" onClick={() => onLesson((lesson + 1) % lessons.length)}>
            {lesson === lessons.length - 1 ? "Start again" : "Next"}
            <ArrowRight />
          </Button>
        </div>
      </section>
      <output className="shortcut-result">{message}</output>
      <details className="learn-details">
        <summary>Shortcut index</summary>
        <div className="shortcut-index">
          <p>H left · J down · K up · L right</p>
          {modes.map((action) => (
            <div className="shortcut-row" key={action.value}>
              <h3>{action.label}</h3>
              <div>
                {directions.map(({ key, direction, Icon }) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => onCommand({ type: action.value, direction })}
                    aria-label={`Try ${action.value} ${direction} · ${action.spoken} ${key}`}
                  >
                    <Icon />
                    <kbd>{key}</kbd>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <p className="small-copy">
            Option + 1–0 switches workspaces. Option + Shift + 1–0 sends the focused window. In this
            demo, workspaces 1–5 stay on the left display and 6–0 stay on the right. In Focus mode,
            click a number to show and focus that workspace.
          </p>
        </div>
      </details>
      <details className="learn-details">
        <summary>Browser keyboard practice</summary>
        <p>
          Frame’s Option shortcuts are global. If Frame is running, they can affect your real
          desktop before a browser receives them. This demo cannot block or detect that.
        </p>
        <p>
          Practice here with explicitly remapped <strong>plain keys</strong>: F/M/R chooses
          Focus/Move/Resize; H/J/K/L applies a direction; N opens and X closes. Number keys switch
          in Focus mode and send in Move mode. Escape exits and Tab leaves normally.
        </p>
        <Button variant="outline" onClick={onPractice}>
          <Keyboard />
          Start keyboard practice
        </Button>
      </details>
    </div>
  );
}
