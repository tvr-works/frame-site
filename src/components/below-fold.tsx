const movements = [
  {
    name: "Focus",
    modifiers: ["⌥"],
    spoken: "Option H J K L",
    image: "focus",
    caption: "Choose a window.",
  },
  {
    name: "Move",
    modifiers: ["⌥", "⇧"],
    spoken: "Option Shift H J K L",
    image: "move",
    caption: "Move between columns or rows.",
  },
  {
    name: "Resize",
    modifiers: ["⌥", "⇧", "⌃"],
    spoken: "Option Shift Control H J K L",
    image: "resize",
    caption: "Resize a column or row.",
  },
];

export function BelowFold() {
  return (
    <div className="explanation">
      <section aria-labelledby="structure-title">
        <h2 id="structure-title" className="explanation-title">
          Workspaces, columns, <br />
          and rows.
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
          <figcaption>One workspace. Two columns. Three windows.</figcaption>
        </figure>
      </section>
      <section className="movements-section" aria-labelledby="movements-title">
        <h2 id="movements-title" className="explanation-title">
          Simple composable movements
        </h2>
        <p className="explanation-lead">Keep the direction. Add a modifier.</p>
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
                    {movement.modifiers.map((key) => (
                      <kbd className="movement-key" data-added={key !== "⌥" || undefined} key={key}>
                        {key}
                      </kbd>
                    ))}
                    {["H", "J", "K", "L"].map((key) => (
                      <kbd className="movement-key" key={key}>
                        {key}
                      </kbd>
                    ))}
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
