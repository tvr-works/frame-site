export function Guide({ install = false }: { install?: boolean }) {
  return (
    <div className="guide-content">
      {install ? (
        <>
          <p>
            Install the menu bar app and command-line client with{" "}
            <a href="https://brew.sh/">Homebrew</a>.
          </p>
          <pre className="install-command">
            <code>brew tap tvr-works/tap{"\n"}brew install --cask tvr-works/tap/frame</code>
          </pre>
          <p className="small-copy">
            Requires macOS Ventura or later. Prefer a direct download?{" "}
            <a href="https://github.com/tvr-works/frame/releases/latest">
              Get the latest release ↗
            </a>
          </p>
          <h3>Give Frame a clear view</h3>
          <p>
            Open Frame from Applications. Allow Accessibility access in System Settings → Privacy
            &amp; Security → Accessibility so Frame can arrange your windows.
          </p>
          <h3>Make it part of your day</h3>
          <p>
            Frame works with its defaults from the first launch. Set start-at-login = true in your
            configuration when you’re ready.
          </p>
        </>
      ) : (
        <>
          <h3>A place for every window</h3>
          <p>
            Frame arranges windows in columns. On a landscape display, your second window opens a
            column to the right. Subsequent windows stack in the focused column.
          </p>
          <h3>Focus, move, resize</h3>
          <p>
            Use Option + H/J/K/L to focus left/down/up/right. Add Shift to move the window, or
            Control + Shift to resize. Focus stops at workspace edges; moving left or right at an
            edge creates a column.
          </p>
          <h3>Workspaces that remember</h3>
          <p>
            Option + 1–0 switches workspaces. Add Shift to send the focused window there while
            staying in your current workspace. Workspaces remember their display; an unused
            workspace starts on your main display.
          </p>
          <h3>Make it yours</h3>
          <p>
            Create <code>~/.frame.toml</code> to customize gaps, shortcuts and startup. You can also
            use the <code>frame</code> CLI for scripting.
          </p>
          <a href="https://github.com/tvr-works/frame#configuration">
            Read the configuration guide ↗
          </a>
        </>
      )}
      <p className="guide-source">
        <a href="https://github.com/tvr-works/frame">Source &amp; documentation</a>
        <span>
          Made by <a href="https://tvr.works">TVR Works</a>
        </span>
      </p>
    </div>
  );
}
