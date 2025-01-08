type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

export const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="relative h-2 my-2"
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
