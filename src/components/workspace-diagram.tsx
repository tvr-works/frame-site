export function WorkspaceDiagram() {
  return (
    <figure className="structure-figure" data-not-typeset>
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
  );
}
