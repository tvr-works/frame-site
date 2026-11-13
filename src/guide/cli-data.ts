export const cliGroups = [
  {
    name: "Query apps, windows and displays",
    commands: [
      {
        name: "list-apps",
        syntax: "frame list-apps [--macos-native-hidden [no]] [--count | --json]",
        description:
          "List applications registered with Frame. Use the bundle IDs in this output when writing classification rules.",
        options: [
          "--macos-native-hidden selects apps hidden by macOS; add no to select apps that are not hidden. Omit the flag for both.",
          "--json returns objects with app-pid, app-bundle-id and app-name. --count returns a number. These output flags cannot be combined.",
        ],
        examples: ["frame list-apps --json"],
      },
      {
        name: "list-monitors",
        syntax: "frame list-monitors [--focused [no]] [--mouse [no]] [--count | --json]",
        description: "List displays and their one-based Frame monitor IDs.",
        options: [
          "--focused filters by the display containing the focused workspace. --mouse filters by the display containing the pointer. Each accepts no to invert its filter.",
          "--json returns monitor-id and monitor-name. --count returns the number of matches; it cannot be combined with --json.",
        ],
        examples: ["frame list-monitors --json", "frame list-monitors --focused"],
      },
      {
        name: "list-workspaces",
        syntax:
          "frame list-workspaces --monitor <monitor>... [--visible [no]] [--empty [no]] [--count | --json]",
        description:
          "List Frame workspaces on the selected display or displays. A monitor selection is required.",
        options: [
          "A monitor is a one-based ID, focused, mouse or all. Supply multiple selectors after --monitor to combine displays.",
          "--visible selects workspaces currently shown; --empty selects workspaces without windows. Add no to either flag to invert that filter.",
          "--json returns objects with a workspace name. --count returns a number; it cannot be combined with --json.",
        ],
        examples: [
          "frame list-workspaces --monitor all --json",
          "frame list-workspaces --monitor focused --visible",
          "frame list-workspaces --monitor 1 2 --empty no",
        ],
      },
      {
        name: "list-windows",
        syntax:
          "frame list-windows --workspace <workspace>... [--monitor <monitor>...] [--pid <pid>] [--app-bundle-id <id>] [--count | --json]\nframe list-windows --monitor <monitor>... [--workspace <workspace>...] [--pid <pid>] [--app-bundle-id <id>] [--count | --json]\nframe list-windows --focused [--count | --json]",
        description:
          "List windows by workspace, display or the currently focused window. At least one of --workspace, --monitor or --focused is required.",
        options: [
          "Workspace selectors are names, focused or visible. Monitor selectors are one-based IDs, focused, mouse or all. Multiple selectors within one flag are combined; workspace and monitor filters intersect.",
          "--pid and --app-bundle-id narrow a workspace/display query to an app. --focused cannot be combined with any other filtering flag.",
          "--json returns window-id, app-name and window-title. --count returns the number of matches; it cannot be combined with --json.",
        ],
        examples: [
          "frame list-windows --workspace focused --json",
          "frame list-windows --monitor all --app-bundle-id com.apple.Safari",
          "frame list-windows --workspace 2 --count",
          "frame list-windows --focused --json",
        ],
      },
    ],
  },
  {
    name: "Focus and arrange windows",
    commands: [
      {
        name: "focus",
        syntax:
          "frame focus <left|down|up|right> [--wrap-around]\nframe focus <left|down|up|right> [--boundaries <boundary>] [--boundaries-action <action>]\nframe focus --window-id <id>",
        description:
          "Change focus without changing the layout, or focus a particular Frame window ID.",
        options: [
          "The default boundary is workspace and its default action is stop. Boundaries: workspace or all-monitors-outer-frame.",
          "Boundary actions: stop, fail, wrap-around-the-workspace or wrap-around-all-monitors. The last requires all-monitors-outer-frame.",
          "--wrap-around is shorthand for wrapping within the workspace. It cannot be combined with --boundaries or --boundaries-action.",
          "--window-id is a separate form and cannot be combined with direction or boundary options.",
        ],
        examples: [
          "frame focus left",
          "frame focus --wrap-around down",
          "frame focus --window-id frame-123",
        ],
      },
      {
        name: "focus-monitor",
        syntax:
          "frame focus-monitor [--wrap-around] <left|down|up|right|next|prev>\nframe focus-monitor <monitor-pattern>...",
        description:
          "Focus a display’s active workspace. Direction uses display arrangement; next and prev use Frame’s display order.",
        options: [
          "--wrap-around is available for directional and next/prev navigation, not monitor-pattern selection.",
          "Patterns accept main, secondary, a one-based number, or a case-insensitive regular expression matching a display name. Multiple patterns are tried in order.",
        ],
        examples: [
          "frame focus-monitor right",
          "frame focus-monitor --wrap-around next",
          "frame focus-monitor main",
        ],
      },
      {
        name: "move",
        syntax:
          "frame move <left|down|up|right> [--window-id <id>] [--boundaries <boundary>] [--boundaries-action <action>]",
        description:
          "Move a tiled window into a neighboring column or reorder it within its column.",
        options: [
          "--window-id selects a window instead of the current target.",
          "--boundaries accepts workspace (default) or all-monitors-outer-frame. --boundaries-action accepts create-implicit-container (default), stop or fail.",
          "At a horizontal edge, create-implicit-container makes a column and requires --boundaries workspace. stop leaves the window in place; fail reports failure. These options do not turn move into a cross-display transfer.",
          "Vertical movement stops at the top or bottom of the column. Moving excluded, native-fullscreen, minimized or hidden-app windows is not supported.",
        ],
        examples: [
          "frame move right",
          "frame move left --boundaries-action stop",
          "frame move down --window-id frame-123",
        ],
      },
      {
        name: "resize",
        syntax:
          "frame resize <width|height|smart|smart-opposite> <points|+points|-points> [--window-id <id>]",
        description: "Resize the target and share the difference among sibling columns or rows.",
        options: [
          "width adjusts column width; height adjusts the window’s row height. smart uses the nearest parent orientation; smart-opposite uses the other orientation.",
          "A plain number sets the target layout size. A signed number pushes its active boundary by that many points. For the last column or row the active boundary is the leading edge, so do not assume + always makes it larger.",
          "--window-id selects a Frame window. A resize needs a sibling to share space with.",
        ],
        examples: [
          "frame resize width -50",
          "frame resize height +50",
          "frame resize width 800 --window-id frame-123",
        ],
      },
      {
        name: "fullscreen",
        syntax: "frame fullscreen [on|off] [--window-id <id>] [--no-outer-gaps] [--fail-if-noop]",
        description:
          "Toggle Frame’s fullscreen overlay for a tiled window. This is a Frame layout state, separate from macOS’s native fullscreen Space.",
        options: [
          "Omit on/off to toggle. Use an explicit state for scripts that must be repeatable.",
          "--no-outer-gaps removes outer gaps while enabling the overlay; it cannot be used with off.",
          "--fail-if-noop requires on or off and returns failure when the window is already in that state. --window-id selects a particular window.",
        ],
        examples: [
          "frame fullscreen",
          "frame fullscreen on --no-outer-gaps",
          "frame fullscreen off --window-id frame-123",
        ],
      },
      {
        name: "add-column",
        syntax: "frame add-column",
        description:
          "Create a column immediately after the target window’s column and move that window into it.",
        options: [
          "There are no command-specific flags. This operates on the current target; it does not create a permanently empty column.",
        ],
        examples: ["frame add-column"],
      },
      {
        name: "remove-column",
        syntax: "frame remove-column",
        description:
          "Remove the last column in the target workspace, moving its windows into the column to its left. It does not close those windows.",
        options: [
          "There are no command-specific flags. If only one column remains, the command leaves it in place. This removes the last column, not necessarily the focused column.",
        ],
        examples: ["frame remove-column"],
      },
      {
        name: "balance-sizes",
        syntax: "frame balance-sizes [--workspace <name>]",
        description:
          "Reset column and row weights to equal shares within their respective parents.",
        options: [
          "--workspace selects a named workspace. Without it, Frame uses the current target workspace.",
        ],
        examples: ["frame balance-sizes", "frame balance-sizes --workspace 2"],
      },
      {
        name: "move-mouse",
        syntax:
          "frame move-mouse <window-lazy-center|window-force-center|monitor-lazy-center|monitor-force-center> [--fail-if-noop]",
        description: "Place the pointer at the target window or display’s center.",
        options: [
          "lazy-center leaves the pointer where it is if it is already inside the target. force-center always centers it.",
          "--fail-if-noop is available only for the two lazy-center targets.",
        ],
        examples: ["frame move-mouse monitor-lazy-center", "frame move-mouse window-force-center"],
      },
    ],
  },
  {
    name: "Switch and send between workspaces",
    commands: [
      {
        name: "workspace",
        syntax:
          "frame workspace <name> [--fail-if-noop]\nframe workspace <next|prev> [--wrap-around] [--stdin|--no-stdin]",
        description:
          "Show a named workspace, or select the next/previous workspace on the target display.",
        options: [
          "Direct names select that workspace; --fail-if-noop fails if it is already focused.",
          "next/prev use the target display’s available workspaces in sorted order. --wrap-around cycles past the end.",
          "--stdin reads an explicit ordered list of workspace names, one per line. --no-stdin ignores piped input. These flags apply only to next/prev. Non-terminal input requires one of them; lists are limited to 1,000 lines.",
        ],
        examples: [
          "frame workspace 2",
          "frame workspace next --wrap-around --no-stdin",
          "printf '1\\n2\\n3\\n' | frame workspace next --stdin --wrap-around",
        ],
      },
      {
        name: "move-node-to-workspace",
        syntax:
          "frame move-node-to-workspace <name> [--window-id <id>] [--focus-follows-window] [--fail-if-noop]\nframe move-node-to-workspace <next|prev> [--focus-follows-window] [--wrap-around] [--stdin|--no-stdin]",
        description:
          "Send a window to another workspace. By default, focus stays in the source workspace.",
        options: [
          "--focus-follows-window activates the destination and keeps that window focused, matching the website demo.",
          "--window-id selects a window for a direct named destination; it cannot be combined with next/prev. --fail-if-noop is also limited to a named destination.",
          "For next/prev, --wrap-around and explicit --stdin/--no-stdin work like workspace. The relative destination is resolved from the source workspace.",
        ],
        examples: [
          "frame move-node-to-workspace 2",
          "frame move-node-to-workspace --focus-follows-window 2",
          "frame move-node-to-workspace next --no-stdin --wrap-around",
        ],
      },
    ],
  },
  {
    name: "Configuration and diagnostics",
    commands: [
      {
        name: "reload-config",
        syntax: "frame reload-config",
        description:
          "Read the configuration again and apply valid settings, including shortcuts and login behavior.",
        options: [
          "There are no command-specific flags. The command reports configuration errors instead of applying an invalid file. Run doctor first to validate changes.",
        ],
        examples: ["frame doctor && frame reload-config"],
      },
      {
        name: "doctor",
        syntax: "frame doctor",
        description:
          "Report the CLI/app versions and configuration health. A running app is needed to validate its configuration.",
        options: [
          "There are no command-specific flags. If the app is unavailable, doctor can still report the client version and the missing connection; it cannot validate the app’s configuration then.",
          "A nonzero exit status indicates a problem such as an unavailable app, a version mismatch or invalid configuration.",
        ],
        examples: ["frame doctor", "frame --version"],
      },
      {
        name: "debug-window-events",
        syntax: "frame debug-window-events",
        description:
          "Toggle window-event diagnostics for the frontmost app and report the logging state and file location.",
        options: [
          "There are no command-specific flags. The default log is /tmp/frame-window-events.log and includes classification signals and window titles.",
          "To diagnose another app, bind this command to a shortcut, focus that app, then use the shortcut to start and stop logging. Running it from Terminal targets the frontmost app at that moment.",
        ],
        examples: ["frame debug-window-events"],
      },
    ],
  },
];
