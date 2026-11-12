# Demo wording and pacing

Labels use a consistent verb → object → direction/result pattern. A column is a vertical stack of windows. A row is one window’s slot inside that column. Focus changes the active window; Move changes its position; Resize changes column width or row height.

One prominent label remains centered between the two monitor feet. On narrow layouts it sits in the reserved gap between the stacked monitors. The label, full key chord and layout change appear together, then hold before the next step. Repeated steps use the same label, keeping attention on the size or position change rather than new copy. There are no shortcut symbols or implementation details in the label.

| Stage         | Keys                 | Visible wording                                                 | What changes                                  |
| ------------- | -------------------- | --------------------------------------------------------------- | --------------------------------------------- |
| Empty         | —                    | Start with an empty workspace                                   | Both monitors are empty                       |
| First window  | —                    | Open window to fill workspace                                   | Reading fills workspace 1                     |
| Second window | —                    | Open window in a new column                                     | Notes creates a right column                  |
| Third window  | —                    | Stack window below                                              | Editor stacks below Notes                     |
| Focus         | ⌥ K / J              | Focus window above / Focus window below                         | Focus changes within the column               |
| Focus         | ⌥ H / L              | Focus window to the left / Focus window to the right            | Focus changes between columns                 |
| Move          | ⌥ ⇧ L                | Move window right into a new column                             | Editor gets a new column                      |
| Move          | ⌥ ⇧ H                | Move window one column left                                     | Editor rejoins the adjacent stack             |
| Move          | ⌥ ⇧ K / J            | Move window up within column / Move window down within column   | Editor changes rows in the same column        |
| Column width  | ⌥ ⇧ ⌃ H, three times | Expand column left                                              | Rightmost column grows toward the left        |
| Column width  | ⌥ ⇧ ⌃ L              | Shrink column from the left                                     | Its left boundary moves right                 |
| Row height    | ⌥ ⇧ ⌃ K, twice       | Expand row upward                                               | Bottom row grows toward the top               |
| Row height    | ⌥ ⇧ ⌃ J              | Shrink row from the top                                         | Its top boundary moves down                   |
| Send          | ⌥ ⇧ 7                | Send window to workspace 7                                      | Editor moves to the right display, focused    |
| Return        | ⌥ ⇧ 1                | Return window to workspace 1                                    | Editor returns to the left display, focused   |
| Close         | Red dot              | Close editor window / Close Notes window / Close Reading window | One window closes at a time; survivors retile |

Resize wording describes the demonstrated edge, not a universal promise that a direction always grows or shrinks. Frame reverses the resize sign for the last sibling. The script deliberately keeps the rightmost column and bottom row focused so these labels match the visible geometry.

The opening waits 1.2 seconds and spaces window openings 1.2 seconds apart. The shortcut section waits another 2.25 seconds before its first focus action. Shortcut labels, full key chords and layout commands share one beat. Existing action intervals are preserved as pauses before the next step, without a leading text or modifier phase. Column and row resizing each get several increments, with a short pause between the two groups. After the workspace round trip, the scene settles for 2.4 seconds. Closing proceeds at 1.6-second intervals, with each red dot lit for 650 ms beforehand. That preview retains the previous action label; the close label changes when the window actually closes. Both monitors remain empty for 3 seconds before the next window opens. Window geometry transitions take 550 ms. A full cycle is approximately 43 seconds.
