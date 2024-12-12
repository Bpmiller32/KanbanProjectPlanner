import { motion } from "framer-motion";
import { CardType } from "../types/CardType";
import { DropIndicator } from "./DropIndicator";

// TODO: rewrite with interface
type CardProps = CardType & {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handleDragStart: Function;
};

export const Card = ({ title, id, column, handleDragStart }: CardProps) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};
