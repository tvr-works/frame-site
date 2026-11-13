const movements = [
  {
    name: "Focus",
    modifiers: ["⌥"],
    spoken:
      "Option with H, J, K or L focuses a window in that direction. Option with a number key (1 through 9, or 0) switches to that workspace.",
    workspace: true,
    image: "focus",
    caption: "Move focus between windows or workspaces.",
  },
  {
    name: "Move",
    modifiers: ["⌥", "⇧"],
    spoken:
      "Option Shift with H, J, K or L moves a window in that direction. Option Shift with a number key (1 through 9, or 0) sends the window to that workspace.",
    workspace: true,
    image: "move",
    caption: "Move windows between columns, rows, or workspaces.",
  },
  {
    name: "Resize",
    modifiers: ["⌥", "⇧", "⌃"],
    spoken:
      "Option Shift Control with H or L resizes column width; with J or K it resizes row height.",
    workspace: false,
    image: "resize",
    caption: "Push column edges left or right. Push row edges up or down.",
  },
];

export function BelowFold() {
  return (
    <div className="explanation">
      <section aria-labelledby="structure-title">
        <h2 id="structure-title" className="explanation-title">
          Simple structure
        </h2>
        <p className="explanation-lead">
          A workspace contains columns. Windows stack as rows within each column.
        </p>
        <figure className="structure-figure">
          <picture>
            <source
              media="(max-width: 600px)"
              width="1320"
              height="1192"
              srcSet="/illustrations/workspace-structure-mobile.webp"
            />
            <img
              src="/illustrations/workspace-structure.webp"
              width="1517"
              height="1037"
              loading="lazy"
              decoding="async"
              alt="A workspace contains two columns. Window A fills the left column. Windows B and C form two rows in the right column; Window C is focused."
            />
          </picture>
        </figure>
      </section>
      <section className="movements-section" aria-labelledby="movements-title">
        <h2 id="movements-title" className="explanation-title">
          Simple composable movements
        </h2>
        <p className="explanation-lead">
          Choose your action with modifiers, then a direction or workspace number.
        </p>
        <div className="movement-list">
          {movements.map((movement) => (
            <article
              className="movement-row"
              key={movement.image}
              aria-labelledby={`${movement.image}-title`}
            >
              <div className="movement-command">
                <h3 id={`${movement.image}-title`}>{movement.name}</h3>
                <p className="movement-shortcut">
                  <span className="sr-only">{movement.spoken}</span>
                  <span className="movement-keycaps" aria-hidden="true">
                    <span className="movement-modifiers">
                      {movement.modifiers.map((key) => (
                        <kbd className="movement-key" data-modifier="true" key={key}>
                          {key}
                        </kbd>
                      ))}
                    </span>
                    <span className="movement-join">+</span>
                    <span className="movement-targets">
                      <span className="movement-directions">
                        {["H", "J", "K", "L"].map((key) => (
                          <kbd className="movement-key" key={key}>
                            {key}
                          </kbd>
                        ))}
                      </span>
                      {movement.workspace ? (
                        <span className="movement-workspace">
                          <span>or</span>
                          <kbd className="movement-key" data-workspace="true">
                            1–0
                          </kbd>
                          <span>workspace</span>
                        </span>
                      ) : null}
                    </span>
                  </span>
                </p>
              </div>
              <figure className="movement-figure">
                <img
                  src={`/illustrations/movement-${movement.image}.webp`}
                  width="720"
                  height="432"
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
                <figcaption>{movement.caption}</figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
