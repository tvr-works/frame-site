export function WorkspaceBank({
  names,
  activeWorkspace,
  litKey,
}: {
  names: readonly string[];
  activeWorkspace: string;
  litKey?: string;
}) {
  return (
    <div className="number-bank">
      {names.map((name) => (
        <span
          key={name}
          className="shortcut-key workspace-key"
          data-active={activeWorkspace === name || undefined}
          data-lit={litKey === name || undefined}
        >
          <kbd>{name}</kbd>
        </span>
      ))}
    </div>
  );
}
