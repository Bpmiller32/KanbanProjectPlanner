import React from "react";
import { motion } from "framer-motion";
import { CardType } from "../types/CardType";
import { DropIndicator } from "./DropIndicator";

interface CardProps extends CardType {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
  isDragging?: boolean;
}

export const Card = ({ title, id, column, order, handleDragStart, isDragging }: CardProps) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleDragStart(e, { title, id, column, order });
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div layout layoutId={id}>
        <div
          draggable="true"
          onDragStart={onDragStart}
          className={`cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing transition-opacity duration-200 ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          <p className="text-sm text-neutral-100">{title}</p>
        </div>
      </motion.div>
    </>
  );
};
