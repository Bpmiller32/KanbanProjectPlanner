import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardType } from "../types/CardType";
import { DropIndicator } from "./DropIndicator";

interface CardProps extends CardType {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
  isDragging?: boolean;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}

export const Card = ({ title, id, column, order, completed, handleDragStart, isDragging, setCards }: CardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleCompletedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, completed: e.target.checked } : card
      )
    );
  };
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
          <div className="flex justify-between items-start gap-2 relative">
            <input
              type="checkbox"
              checked={completed}
              onChange={handleCompletedChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-1 cursor-pointer"
            />
            <div className="flex-1 pl-6">
            {isEditing ? (
              <textarea
                style={{ textDecoration: completed ? 'line-through' : 'none' }}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  if (editedTitle.trim() !== title) {
                    setCards((prevCards) =>
                      prevCards.map((card) =>
                        card.id === id ? { ...card, title: editedTitle.trim() } : card
                      )
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') {
                    setEditedTitle(title);
                    setIsEditing(false);
                  }
                }}
                className="w-full bg-neutral-700 text-sm text-neutral-100 p-1 rounded outline-none resize-none min-h-[1.5rem]"
                autoFocus
                rows={editedTitle.split('\n').length}
              />
            ) : (
              <p 
                className="text-sm text-neutral-100 whitespace-pre-wrap"
                style={{ textDecoration: completed ? 'line-through' : 'none' }}
              >{title}</p>
            )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              ✎
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
