interface DropIndicatorProps {
  beforeId: string | null;
  column: string;
}

export const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  /* ----------------------------- Render function ---------------------------- */
  return (
    <div
      data-before={beforeId || ""}
      data-column={column}
      className="relative h-2"
      data-type="drop-indicator"
      style={{
        marginTop: beforeId ? "0.5rem" : "0.25rem",
        marginBottom: beforeId ? "0.5rem" : "0.25rem",
      }}
    >
      <div className="absolute inset-x-0 h-2 flex items-center pointer-events-none">
        <div
          data-indicator-line
          className="w-full h-0.5 bg-violet-400 opacity-0 transition-opacity duration-75"
        />
      </div>
    </div>
  );
};
