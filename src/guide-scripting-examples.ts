export const sketchybarScript =
  '#!/bin/sh\n# Called by SketchyBar; NAME is the item being updated.\nlabel=""\nfor monitor in $(frame list-monitors 2>/dev/null | awk \'{print $1}\'); do\n  workspace=$(frame list-workspaces --monitor "$monitor" --visible 2>/dev/null | head -n 1)\n  [ -n "$workspace" ] || continue\n  [ -z "$label" ] || label="$label | "\n  label="${label}${monitor}: ${workspace}"\ndone\nsketchybar --set "$NAME" label="${label:-none}"\n';
export const sketchybarSetup =
  'sketchybar --add event frame_workspace_change\nsketchybar --add item frame.workspace left \\\n  --set frame.workspace \\\n    script="$HOME/.config/sketchybar/plugins/frame-workspaces.sh" \\\n    update_freq=30 \\\n  --subscribe frame.workspace frame_workspace_change display_change system_woke';
export const workspaceHook =
  'workspace-change-hook = [\n  "/bin/sh",\n  "-c",\n  \'sketchybar --trigger frame_workspace_change FOCUSED_WORKSPACE="$FRAME_FOCUSED_WORKSPACE"\'\n]';
