import { cliGroups } from "@/guide/cli-data";
import { configKeys } from "@/guide/config-data";
import { sketchybarScript, sketchybarSetup, workspaceHook } from "@/guide/scripting-examples";

export function ConfigurationGuide() {
  return (
    <section id="configuration" aria-labelledby="configuration-title">
      <h2 id="configuration-title">Configuration</h2>
      <p>
        Frame works without a custom file. Once you add one, it replaces the built-in configuration
        rather than merging with it. Start from the bundled defaults so shortcuts, workspace names
        and gaps stay intact.
      </p>
      <pre className="code-block" data-language="sh">
        <code>
          cp -n /Applications/Frame.app/Contents/Resources/default-config.toml ~/.frame.toml
        </code>
      </pre>
      <p>
        The command leaves an existing file intact. Edit that file if it already exists. You can
        also{" "}
        <a href="https://github.com/tvr-works/frame/blob/main/docs/config-examples/default-config.toml">
          read the complete default configuration
        </a>
        .
      </p>
      <h3>File location and validation</h3>
      <p>
        The usual location is <code>~/.frame.toml</code>. Frame also checks{" "}
        <code>$XDG_CONFIG_HOME/frame/.frame.toml</code>, or <code>~/.config/frame/.frame.toml</code>{" "}
        when XDG_CONFIG_HOME is unset. Keep only one of those files: finding both is an ambiguity
        error, not a precedence rule. An explicit <code>--config-path</code> passed to the app
        selects that file instead.
      </p>
      <p>
        The app’s startup flag is separate from the client API. Quit Frame before launching the
        installed app executable with an explicit configuration path, for example{" "}
        <code>
          /Applications/Frame.app/Contents/MacOS/Frame --config-path /absolute/path/to/frame.toml
        </code>
        . The file must exist.
      </p>
      <pre className="code-block" data-language="sh">
        <code>{"frame doctor\nframe reload-config"}</code>
      </pre>
      <p>
        Validate edits with <code>frame doctor</code>, fix any errors, then reload. Unknown keys,
        wrong value types, invalid patterns and duplicate bindings are errors. Put top-level
        settings before the first TOML table heading; edit existing tables instead of declaring a
        second copy of the same table.
      </p>
      <h3>Configuration reference</h3>
      <dl className="guide-settings" data-not-typeset>
        {configKeys.map(([key, description]) => (
          <div key={key}>
            <dt>
              <code>{key}</code>
            </dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
      <h3>Startup and persistent workspaces</h3>
      <pre className="code-block" data-language="toml">
        <code>
          {
            'start-at-login = true\npersistent-workspaces = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]'
          }
        </code>
      </pre>
      <p>
        Persistent workspaces stay available when empty. This is useful for fixed shortcuts,
        relative workspace navigation and status-bar indicators. Persistence does not assign a
        display; use display rules for that.
      </p>
      <h3>Bindings and command composition</h3>
      <p>
        In the existing <code>[binding]</code> table, the modifier names are <code>alt</code>{" "}
        (Option), <code>shift</code>, <code>ctrl</code> (Control) and <code>cmd</code> (Command). A
        binding takes a command string or an array of Frame commands run in order.
      </p>
      <pre className="code-block" data-language="toml">
        <code>
          {
            '[binding]\nalt-h = "focus left"\nalt-shift-2 = "move-node-to-workspace --focus-follows-window 2"\nalt-b = ["balance-sizes", "focus left"]\nctrl-alt-d = "debug-window-events"'
          }
        </code>
      </pre>
      <p>
        These are entries to add or edit, not a complete bindings table. Keep every default binding
        you still want. The send example enables follow-focus for that shortcut; it is not the
        native send default.
      </p>
      <p>
        Bindings accept focus, move, resize, workspace, move-node-to-workspace, focus-monitor,
        fullscreen, add-column, remove-column, balance-sizes, move-mouse, reload-config and
        debug-window-events. Query commands and arbitrary shell commands are not binding actions.
        Run the CLI from a script or launcher when you need shell logic.
      </p>
      <h3>Keyboard layout and custom notation</h3>
      <pre className="code-block" data-language="toml">
        <code>
          {
            '[key-mapping]\npreset = "qwerty"\n\n[key-mapping.key-notation-to-key-code]\nmykey = "semicolon"'
          }
        </code>
      </pre>
      <p>
        Available presets are <code>qwerty</code>, <code>dvorak</code> and <code>colemak</code>. The
        optional notation table adds aliases for physical key codes. In this example,{" "}
        <code>alt-mykey</code> can be used in the bindings table. Alias names cannot contain
        whitespace or hyphens; mapped values must be recognized key-code names.
      </p>
      <h3>Gaps, including per-display values</h3>
      <pre className="code-block" data-language="toml">
        <code>
          {
            '[gaps]\ninner.horizontal = 8\ninner.vertical = 8\nouter.left = 8\nouter.right = 8\nouter.bottom = 8\nouter.top = [{ monitor."Built-in Retina Display" = 0 }, 32]'
          }
        </code>
      </pre>
      <p>
        Inner gaps separate windows; outer gaps separate the layout from the work-area edges. All
        six values accept a constant number of points or a per-display array. The example uses no
        top gap on a matching built-in display and 32 points elsewhere.
      </p>
      <p>
        A per-display array contains one or more monitor rules followed by a numeric fallback. The
        first matching rule wins. Monitor selectors can be <code>main</code>, <code>secondary</code>
        , a one-based order, or a case-insensitive display-name regular expression.
      </p>
      <h3>Pin workspaces to displays</h3>
      <pre className="code-block" data-language="toml">
        <code>
          {
            '[workspace-to-monitor-force-assignment]\n1 = "main"\n2 = "secondary"\n3 = [".*Studio.*", "main"]'
          }
        </code>
      </pre>
      <p>
        A value can be one selector or an ordered list. Frame uses the first matching display. The
        third rule prefers a display whose name matches Studio and falls back to the macOS primary
        display. Main does not mean left; use <code>frame list-monitors</code> to inspect names and
        one-based IDs.
      </p>
      <p>
        See <a href="#window-rules">Accessibility and window rules</a> for classification overrides,
        and <a href="#scripting">Scripting and integrations</a> for workspace hooks.
      </p>
    </section>
  );
}

export function WindowRulesGuide() {
  return (
    <section id="window-rules" aria-labelledby="window-rules-title">
      <h2 id="window-rules-title">Accessibility and window rules</h2>
      <p>
        Frame uses Apple’s Accessibility API to discover other apps’ windows, observe changes, and
        request position and size updates. That is why it needs Accessibility permission.{" "}
        <a href="https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXmodel.html">
          Apple’s accessibility model
        </a>{" "}
        depends on the information and actions each app exposes.
      </p>
      <p>
        Apps do not always report window roles, subroles, titles or controls consistently. A
        document, dialog and temporary panel can look similar in that information. Frame combines
        those signals with app-specific heuristics to decide which windows belong in the tiled
        layout.
      </p>
      <h3>Override a window’s classification</h3>
      <p>
        Add ordered <code>[[window-classification-override]]</code> rules to your configuration. A
        rule requires at least one matcher and a <code>kind</code>. All matchers in one rule must
        match; the first matching rule wins.
      </p>
      <dl className="guide-settings" data-not-typeset>
        <div>
          <dt>
            <code>if.app-id</code>
          </dt>
          <dd>
            Exact app bundle ID. Find it with <code>frame list-apps --json</code>.
          </dd>
        </div>
        <div>
          <dt>
            <code>if.app-name-regex-substring</code>
          </dt>
          <dd>
            Case-insensitive regular expression matching part of the app name. Use anchors when you
            want the whole name.
          </dd>
        </div>
        <div>
          <dt>
            <code>if.window-title-regex-substring</code>
          </dt>
          <dd>Case-insensitive regular expression matching part of the window title.</dd>
        </div>
        <div>
          <dt>
            <code>kind = "tiling"</code>
          </dt>
          <dd>Include the matching window in the tiled workspace layout.</dd>
        </div>
        <div>
          <dt>
            <code>kind = "excluded"</code>
          </dt>
          <dd>
            Keep it outside tiled workspace management. Excluded windows are not workspace-local
            tiles and can remain visible across workspace switches.
          </dd>
        </div>
      </dl>
      <pre className="code-block" data-language="toml">
        <code>
          {
            '[[window-classification-override]]\nif.app-id = "com.example.Player"\nif.window-title-regex-substring = "picture[- ]in[- ]picture"\nkind = "excluded"\n\n[[window-classification-override]]\nif.app-id = "com.example.Player"\nif.window-title-regex-substring = "^Library$"\nkind = "tiling"'
          }
        </code>
      </pre>
      <p>
        Replace the example bundle ID and titles with values from your app. Put specific rules
        before broader ones. Prefer a title-specific rule when only one kind of window needs
        correction, rather than forcing every dialog from an app into tiling.
      </p>
      <p>
        Validate and reload the file, then reopen the affected window if needed. An override changes
        Frame’s placement decision; it cannot supply a missing Accessibility window or make an app
        accept position and size requests it does not support.
      </p>
      <h3>Inspect inconsistent window reports</h3>
      <p>
        Add <code>ctrl-alt-d = "debug-window-events"</code> to the existing bindings table. Focus
        the affected app, press that shortcut, reproduce the behavior, then press it again to stop.
        Frame reports the log path; its default is <code>/tmp/frame-window-events.log</code>. The
        log includes window titles, observed events and classification signals.
      </p>
    </section>
  );
}

export function CommandLineGuide() {
  return (
    <section id="command-line" aria-labelledby="command-line-title">
      <h2 id="command-line-title">Command-line API</h2>
      <p>
        The CLI exposes Frame’s window actions and state queries to shell scripts, launchers and
        other apps. Use it to automate layouts, select a specific window, or build a
        display/workspace indicator. The menu bar app performs the window management; the client
        sends requests to it.
      </p>
      <p>
        Run <code>frame &lt;command&gt; [arguments]</code> while the app is running. Every command
        accepts <code>-h</code> or <code>--help</code>. Global <code>frame --help</code> and{" "}
        <code>frame --version</code> also work without the app. Arguments shown in angle brackets
        below are placeholders to replace.
      </p>
      <h3>Targets, output and exit status</h3>
      <p>
        Actions use the focused window or workspace unless a target is supplied. Supported{" "}
        <code>--window-id</code> or <code>--workspace</code> flags take precedence over the
        environment. For target-aware commands, <code>FRAME_WINDOW_ID</code> is checked next, then{" "}
        <code>FRAME_WORKSPACE</code>, then current focus.
      </p>
      <p>
        Use Frame IDs such as <code>frame-123</code> from <code>list-windows</code>, not macOS
        window numbers. IDs are session-specific; query them rather than hard-coding them across app
        restarts.
      </p>
      <p>
        Query commands print text by default. <code>--json</code> returns a JSON array;{" "}
        <code>--count</code> prints a number. They are mutually exclusive. A zero exit status means
        success, and nonzero means failure. Some no-op actions can print an explanation to stderr
        while still succeeding; use <code>--fail-if-noop</code> where offered when that distinction
        matters to a script.
      </p>
      <nav aria-label="Command reference" data-not-typeset>
        <ul className="guide-command-index">
          {cliGroups
            .flatMap((group) => group.commands)
            .map((command) => (
              <li key={command.name}>
                <a href={`#cli-${command.name}`}>
                  <code>{command.name}</code>
                </a>
              </li>
            ))}
        </ul>
      </nav>
      {cliGroups.map((group) => (
        <div key={group.name}>
          <h3>{group.name}</h3>
          {group.commands.map((command) => (
            <div className="guide-command" id={`cli-${command.name}`} key={command.name}>
              <h4>
                <code>{command.name}</code>
              </h4>
              <p>{command.description}</p>
              <pre className="code-block" data-language="text">
                <code>{command.syntax}</code>
              </pre>
              <ul>
                {command.options.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
              <pre className="code-block" data-language="sh">
                <code>{command.examples.join("\n")}</code>
              </pre>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ScriptingGuide() {
  return (
    <section id="scripting" aria-labelledby="scripting-title">
      <h2 id="scripting-title">Scripting and integrations</h2>
      <p>
        The CLI lets you connect Frame to your own tools instead of limiting window management to
        built-in shortcuts. A script can query state, choose an action, and update a status bar or
        launcher.
      </p>
      <h3>Query state for a script</h3>
      <pre className="code-block" data-language="sh">
        <code>
          {
            "frame list-workspaces --monitor focused --visible\nframe list-windows --workspace 2 --count\nframe list-windows --focused --json"
          }
        </code>
      </pre>
      <p>
        The first command prints the visible workspace on the focused display. The second counts
        windows in workspace 2. The JSON window result contains <code>window-id</code>,{" "}
        <code>app-name</code> and <code>window-title</code>. A script can use the returned ID with
        commands that accept <code>--window-id</code>.
      </p>
      <h3>React to workspace changes</h3>
      <p>
        The top-level <code>workspace-change-hook</code> setting runs a process whenever focused
        workspace changes. Its first array element is the executable path and the rest are
        arguments. Use a shell explicitly when you need shell expansion.
      </p>
      <pre className="code-block" data-language="toml">
        <code>{workspaceHook}</code>
      </pre>
      <p>
        Place this before TOML table headings. Frame supplies <code>FRAME_FOCUSED_WORKSPACE</code>,
        preserves inherited environment variables, and prepends{" "}
        <code>/opt/homebrew/bin:/opt/homebrew/sbin</code> to PATH. If SketchyBar is installed
        elsewhere and is not on that PATH, use its absolute executable path. Reload Frame after
        editing the hook.
      </p>
      <h3>Example: display/workspace labels in SketchyBar</h3>
      <p>
        With SketchyBar installed and running, add a custom event and an item to its configuration.
        Subscribe to Frame’s event so the label updates on workspace changes; display and wake
        events plus a periodic refresh keep it current as displays change.
      </p>
      <pre className="code-block" data-language="sh">
        <code>{sketchybarSetup}</code>
      </pre>
      <p>
        Save this script as <code>~/.config/sketchybar/plugins/frame-workspaces.sh</code> and make
        it executable:
      </p>
      <pre className="code-block" data-language="sh">
        <code>{sketchybarScript}</code>
      </pre>
      <pre className="code-block" data-language="sh">
        <code>chmod +x ~/.config/sketchybar/plugins/frame-workspaces.sh</code>
      </pre>
      <p>
        The script asks Frame for each display’s visible workspace and produces a label such as{" "}
        <code>1: 2 | 2: 7</code>. SketchyBar provides <code>NAME</code> for the item to update.
        Reload SketchyBar after registering the item. These are Frame workspace names, not macOS
        Space IDs.
      </p>
      <p>
        This example uses plain-text Frame queries and standard shell tools. Use <code>--json</code>{" "}
        when an integration needs structured fields instead. See the{" "}
        <a href="https://felixkratz.github.io/SketchyBar/config/events">
          SketchyBar event documentation
        </a>{" "}
        for custom events, subscriptions and trigger variables.
      </p>
    </section>
  );
}
