import React, { useState } from "react";
import { motion } from "framer-motion";
import { CardType } from "../../types/CardType";
import { FiTrash } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { EditCard } from "./EditCard";
import { NameInput } from "./NameInput";

interface CardProps extends CardType {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, card: CardType) => void;
  isDragging?: boolean;
  setCards: React.Dispatch<React.SetStateAction<CardType[]>>;
  editorName: string;
  setEditorName: React.Dispatch<React.SetStateAction<string>>;
}

export const Card = ({
  title,
  id,
  column,
  order,
  completed,
  createdBy,
  createdAt,
  lastEditedBy,
  lastEditedTime,
  lastMovedTime,
  isArchived,
  handleDragStart,
  isDragging,
  setCards,
  editorName,
  setEditorName,
}: CardProps) => {
  // States for editing and name input visibility
  const [isEditing, setIsEditing] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  // Function to handle archiving the card
  const handleArchive = (event: React.MouseEvent) => {
    // Prevent event from bubbling up
    event.stopPropagation();

    // Update the card's `isArchived` property
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? { ...card, isArchived: true, lastMovedTime: Date.now() }
          : card
      )
    );
  };

  // Function to handle toggling the completion status of the card
  const handleCompletedChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Prevent event from bubbling up
    event.stopPropagation();

    // Show name input if editor's name is not provided
    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    // Update the card's `completed` property and set the editor's information
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              completed: !completed,
              lastEditedBy: editorName.trim(),
              lastEditedTime: Date.now(),
            }
          : card
      )
    );
  };

  // Function to handle updating the card's title
  const handleUpdate = (newTitle: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              title: newTitle,
              lastEditedBy: editorName.trim(),
              lastEditedTime: Date.now(),
            }
          : card
      )
    );

    // Exit edit mode after updating
    setIsEditing(false);
  };

  // Function to handle completing the card after name input
  const handleNameInputComplete = () => {
    if (!editorName.trim()) return;

    setShowNameInput(false);
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? {
              ...card,
              completed: !completed,
              lastEditedBy: editorName.trim(),
              lastEditedTime: Date.now(),
            }
          : card
      )
    );
  };

  // Function to handle drag start events
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Prevent event from bubbling up
    event.stopPropagation();

    // Pass the drag event and card details to the handler
    handleDragStart(event, {
      id,
      title,
      column,
      order,
      completed,
      createdBy,
      createdAt,
      lastEditedBy,
      lastEditedTime,
      lastMovedTime,
      isArchived,
    });
  };

  return (
    <motion.div layout layoutId={id} className="mb-2">
      <div
        draggable="true"
        onDragStart={onDragStart}
        className={`cursor-grab rounded border bg-neutral-800 p-3 ${
          isDragging ? "opacity-50" : ""
        } transition-all duration-250 hover:bg-neutral-700`}
      >
        <div className="flex justify-between items-start gap-2 relative">
          {showNameInput ? (
            // If checkbox has been clicked, show NameInput if no Name has been set
            <NameInput
              editorName={editorName}
              setEditorName={setEditorName}
              onSubmit={handleNameInputComplete}
              onCancel={() => setShowNameInput(false)}
            />
          ) : isEditing ? (
            // If the card is in edit mode, show the EditCard component
            <EditCard
              title={title}
              editorName={editorName}
              setEditorName={setEditorName}
              onUpdate={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              {/* Checkbox for marking the card as completed */}
              <input
                type="checkbox"
                checked={completed}
                onChange={handleCompletedChange}
                className="absolute left-0 top-1 cursor-pointer"
              />

              {/* Main content */}
              <div className="flex-1 pl-6">
                {/* // If not in edit mode, display the card's title and metadata */}
                <p
                  className="text-sm text-gray-100 whitespace-pre-wrap"
                  style={{
                    textDecoration: completed ? "line-through" : "none",
                  }}
                >
                  {title}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  {/* Display last edited by or created by information */}
                  {lastEditedBy && lastEditedBy !== createdBy
                    ? `Edited by ${lastEditedBy}`
                    : `Created by ${createdBy}`}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Edit button to enter edit mode */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-100 transition-colors duration-[250ms]"
                >
                  <FaRegEdit />
                </button>
                {/* Archive button */}
                <button
                  onClick={handleArchive}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-[250ms]"
                >
                  <FiTrash />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
