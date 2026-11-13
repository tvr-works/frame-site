import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-navigation";
import { InstallCommand, releaseUrl } from "@/components/install";
import {
  ConfigurationGuide,
  WindowRulesGuide,
  CommandLineGuide,
  ScriptingGuide,
} from "@/components/guide-reference";
import { WorkspaceDiagram } from "@/components/workspace-diagram";

const chapters = [
  ["install-frame", "Installation"],
  ["first-launch", "First launch"],
  ["layout", "Windows, columns and rows"],
  ["shortcuts", "Keyboard shortcuts"],
  ["workspaces", "Workspaces and displays"],
  ["configuration", "Configuration"],
  ["window-rules", "Accessibility and window rules"],
  ["command-line", "Command-line API"],
  ["scripting", "Scripting and integrations"],
  ["troubleshooting", "Troubleshooting"],
];
const shortcuts = [
  [
    "Focus",
    "Option + H / J / K / L",
    "Move focus left, down, up or right without moving the window.",
  ],
  [
    "Move",
    "Option + Shift + H / J / K / L",
    "Move the focused window between columns or reorder it within its column.",
  ],
  [
    "Resize a column",
    "Option + Shift + Control + H / L",
    "Change the focused column’s width in 50-point steps.",
  ],
  [
    "Resize a row",
    "Option + Shift + Control + J / K",
    "Change the focused window’s height within its column in 50-point steps.",
  ],
  ["Switch workspace", "Option + 1–0", "Show the workspace assigned to that number."],
  [
    "Send to workspace",
    "Option + Shift + 1–0",
    "Send the focused window to that workspace. Focus stays in the source workspace by default.",
  ],
  ["Fullscreen", "Option + F", "Toggle fullscreen for the focused window."],
];

export default function GuidePage() {
  return (
    <>
      <a className="skip-link" href="#guide-content">
        Skip to guide
      </a>
      <div className="site-shell">
        <SiteHeader guide />
        <main id="guide-content" className="guide-page" tabIndex={-1}>
          <div className="guide-heading">
            <a className="guide-back" href="/">
              <ArrowLeft aria-hidden="true" /> Back to Frame
            </a>
            <h1>User guide</h1>
            <p>Installation, configuration, keyboard shortcuts and the command-line API.</p>
          </div>
          <div className="guide-layout">
            <nav className="guide-toc" aria-label="On this page">
              <p>On this page</p>
              <ol>
                {chapters.map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`}>{label}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="guide-article">
              <section id="install-frame" aria-labelledby="guide-install-title">
                <h2 id="guide-install-title">Install Frame</h2>
                <p>
                  Frame requires macOS 13 Ventura or later. It includes a menu bar app that manages
                  your windows and a <code>frame</code> command-line client for commands and
                  scripts.
                </p>
                <h3>With Homebrew</h3>
                <p>
                  If <a href="https://brew.sh/">Homebrew</a> is installed, run these commands in
                  Terminal:
                </p>
                <InstallCommand />
                <h3>From a release</h3>
                <p>
                  You can also <a href={releaseUrl}>download the latest release</a>. Extract the
                  archive and move <code>Frame.app</code> into Applications. The archive also
                  includes the <code>frame</code> client; Homebrew makes the client available in
                  Terminal automatically.
                </p>
              </section>
              <section id="first-launch" aria-labelledby="first-launch-title">
                <h2 id="first-launch-title">First launch</h2>
                <ol>
                  <li>Open Frame from Applications. The app runs in the menu bar.</li>
                  <li>
                    When prompted, open System Settings → Privacy &amp; Security → Accessibility and
                    enable Frame. This permission lets it move and resize other apps’ windows.
                  </li>
                  <li>
                    Open a few ordinary app windows. Frame tiles them using its built-in defaults;
                    you do not need a configuration file to begin.
                  </li>
                </ol>
                <h3>Try the basic pattern</h3>
                <p>
                  Hold Option and press H, J, K or L to move focus left, down, up or right. Keep
                  Option and add Shift to move the window instead. Add Control as well to resize.
                  Press one direction key at a time.
                </p>
                <p>
                  The shortcuts are handled by the native menu bar app. You do not need to keep
                  Terminal open.
                </p>
              </section>
              <section id="layout" aria-labelledby="layout-title">
                <h2 id="layout-title">Windows, columns and rows</h2>
                <p>
                  A workspace contains columns arranged side by side. Each column contains one or
                  more windows stacked as rows. Windows share the available width and height, with
                  gaps between them.
                </p>
                <WorkspaceDiagram />
                <p>
                  The first window fills an empty workspace. On a landscape display, the next tiled
                  window creates a column to the right when there is only one column. With multiple
                  columns, new windows join the bottom of the focused column. On portrait or square
                  displays, new windows stack in the focused column.
                </p>
                <h3>Focus changes the active window</h3>
                <p>
                  H and L focus an adjacent column’s most recently focused window. J and K focus the
                  window below or above within the current column. Focus stops at the workspace
                  edge.
                </p>
                <h3>Move changes a window’s place</h3>
                <p>
                  Moving left or right sends the window into the adjacent column. At an outer edge,
                  the move creates a column. Moving up or down reorders windows within the same
                  column; it stops at the top or bottom. Empty columns disappear.
                </p>
                <h3>Resize changes the shared space</h3>
                <p>
                  H and L adjust column width. J and K adjust a window’s height within its column.
                  Neighboring columns or rows share the remaining space. A column or row needs a
                  sibling to resize against; a single window filling the workspace has no internal
                  boundary to push.
                </p>
              </section>
              <section id="shortcuts" aria-labelledby="shortcuts-title">
                <h2 id="shortcuts-title">Keyboard shortcuts</h2>
                <p>
                  These are the built-in defaults. H means left, J down, K up and L right.
                  Slash-separated direction keys are alternatives. For workspaces, choose a number
                  key from 1 through 9, or 0.
                </p>
                <div className="guide-table-wrap">
                  <table className="guide-table">
                    <caption className="sr-only">Default keyboard shortcuts</caption>
                    <thead>
                      <tr>
                        <th scope="col">Action</th>
                        <th scope="col">Shortcut</th>
                        <th scope="col">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortcuts.map(([action, keys, result]) => (
                        <tr key={action}>
                          <th scope="row">{action}</th>
                          <td>
                            <code>{keys}</code>
                          </td>
                          <td>{result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <dl className="guide-shortcut-list">
                  {shortcuts.map(([action, keys, result]) => (
                    <div key={action}>
                      <dt>
                        {action}
                        <code>{keys}</code>
                      </dt>
                      <dd>{result}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section id="workspaces" aria-labelledby="workspaces-title">
                <h2 id="workspaces-title">Workspaces and displays</h2>
                <p>
                  Option plus a number switches to that workspace. Option plus Shift and a number
                  sends the focused window there. By default, sending a window keeps focus in the
                  source workspace; switch to the destination to follow it.
                </p>
                <p>
                  On one display, all workspaces use that display. With multiple displays,
                  workspaces remember their display. Workspace numbers do not imply a left or right
                  monitor.
                </p>
                <p>
                  The website demo uses a fixed arrangement: 1–5 on the left display and 6–0 on the
                  right. It also follows a window when sending it. Those are demo choices, not
                  Frame’s native defaults.
                </p>
                <h3>Assign workspaces to a display</h3>
                <p>
                  Add a <code>[workspace-to-monitor-force-assignment]</code> table to your
                  configuration to pin workspaces. For example:
                </p>
                <pre className="code-block" data-language="toml">
                  <code>
                    {'[workspace-to-monitor-force-assignment]\n1 = "main"\n2 = "secondary"'}
                  </code>
                </pre>
                <p>
                  <code>main</code> is the macOS primary display, which may be on either side.{" "}
                  <code>secondary</code> means the other display in a two-display setup. You can
                  also use numeric monitor order or a monitor-name pattern.{" "}
                  <a href="https://github.com/tvr-works/frame#single-vs-dual-monitor-setup">
                    See the full display configuration examples.
                  </a>
                </p>
              </section>
              <ConfigurationGuide />
              <WindowRulesGuide />
              <CommandLineGuide />
              <ScriptingGuide />
              <section id="troubleshooting" aria-labelledby="troubleshooting-title">
                <h2 id="troubleshooting-title">Troubleshooting</h2>
                <h3>Windows are not moving</h3>
                <p>
                  Check that Frame is running in the menu bar and enabled under System Settings →
                  Privacy &amp; Security → Accessibility. Test with an ordinary app window; dialogs
                  and other excluded windows do not join the tiled layout.
                </p>
                <h3>A shortcut does not respond</h3>
                <p>
                  Check for a conflicting shortcut in macOS or the active app. If you have a custom
                  configuration, confirm the binding exists and run <code>frame doctor</code>. Apply
                  corrections with <code>frame reload-config</code>.
                </p>
                <h3>The configuration has an error</h3>
                <p>
                  Frame validates configuration keys, types and values. Run{" "}
                  <code>frame doctor</code> to see the affected section and a CFG error code. On
                  startup, an invalid file produces a configuration error and Frame falls back to
                  its built-in defaults.
                </p>
                <h3>A sent window did not receive focus</h3>
                <p>
                  Sending keeps focus in the source workspace by default. Press Option and the
                  destination number to switch there. The website’s scripted demo intentionally
                  follows sent windows.
                </p>
                <h3>The terminal cannot find frame</h3>
                <p>
                  With a Homebrew installation, check that Homebrew is on your shell’s command path.
                  If you installed the release archive manually, the standalone client also needs to
                  be in a directory on your command path.
                </p>
                <p>
                  For windows that are consistently misclassified, use{" "}
                  <a href="#window-rules">classification overrides and window diagnostics</a> after
                  checking Accessibility permission.
                </p>
                <p>
                  If the issue remains,{" "}
                  <a href="https://github.com/tvr-works/frame/issues">open an issue</a> with your
                  macOS version, Frame version, the action you tried and any relevant error output.
                </p>
              </section>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
