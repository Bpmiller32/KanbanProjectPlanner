import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CardType } from "../types/CardType";
import { ColumnType } from "../types/ColumnType";
import { DropIndicator } from "./DropIndicator";

interface CardProps extends CardType {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
  isDragging?: boolean;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
}

export const Card = ({ 
  title, 
  id, 
  column, 
  order, 
  completed, 
  createdBy,
  lastEditedBy,
  lastEditedTime,
  handleDragStart, 
  isDragging, 
  setCards 
}: CardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editorName, setEditorName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const handleCompletedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setShowNameInput(true);
    // The actual update will happen after the name is provided
  };
  const handleNameSubmit = (action: 'complete' | 'edit' | 'move', newValue?: boolean | string) => {
    if (!editorName.trim()) return;

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== id) return card;
        
        const updatedCard = { 
          ...card, 
          lastEditedBy: editorName.trim(),
          lastEditedTime: Date.now()
        };
        
        switch (action) {
          case 'complete':
            if (typeof newValue === 'boolean') {
              updatedCard.completed = newValue;
            }
            break;
          case 'edit':
            if (typeof newValue === 'string') {
              updatedCard.title = newValue;
            }
            break;
        }
        
        return updatedCard;
      })
    );

    setEditorName("");
    setShowNameInput(false);
    if (action === 'edit') {
      setIsEditing(false);
    }
  };

  const [dragStartColumn, setDragStartColumn] = useState<ColumnType | null>(null);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDragStartColumn(column);
    handleDragStart(e, { 
      title, 
      id, 
      column, 
      order, 
      completed, 
      createdBy, 
      lastEditedBy,
      lastEditedTime: Date.now()
    });
  };

  // Check if card was moved to a different column
  useEffect(() => {
    if (dragStartColumn && dragStartColumn !== column) {
      setDragStartColumn(null);
      setShowNameInput(true);
    }
  }, [column, dragStartColumn]);

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div layout layoutId={id} className="mb-2">
        <div
          draggable="true"
          onDragStart={onDragStart}
          className={`cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing transition-all duration-200 hover:bg-neutral-700 ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          <div className="flex justify-between items-start gap-2 relative">
            {showNameInput ? (
              <div className="w-full p-2 bg-neutral-700 rounded">
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-neutral-600 text-sm text-neutral-100 p-1 rounded outline-none mb-2"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNameInput(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleNameSubmit('edit', editedTitle.trim());
                      } else if (dragStartColumn && dragStartColumn !== column) {
                        handleNameSubmit('move');
                      } else {
                        handleNameSubmit('complete', !completed);
                      }
                    }}
                    className="text-xs text-neutral-100 bg-neutral-600 px-2 py-1 rounded"
                  >
                    {isEditing ? 'Save' : dragStartColumn && dragStartColumn !== column ? 'Confirm Move' : 'Complete'}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                        if (editedTitle.trim() !== title) {
                          setShowNameInput(true);
                        } else {
                          setIsEditing(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (editedTitle.trim() !== title) {
                            setShowNameInput(true);
                          } else {
                            setIsEditing(false);
                          }
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
                  <div className="mt-2 text-xs text-neutral-400">
                    Created by {createdBy}
                    {lastEditedBy !== createdBy && ` • Last edited by ${lastEditedBy}`}
                    <div className="text-neutral-500">
                      Last edited {new Date(lastEditedTime).toLocaleString()}
                    </div>
                  </div>
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
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
