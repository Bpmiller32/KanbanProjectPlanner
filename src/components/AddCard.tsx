import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { ColumnType } from "../types/ColumnType";
import { CardType } from "../types/CardType";
import { FiPlus } from "react-icons/fi";

type AddCardProps = {
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
};

export const AddCard = ({ column, setCards, editorName, setEditorName }: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim().length) return;
    
    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    setCards((prevCards) => {
      // Find the highest order in the target column
      const columnCards = prevCards.filter(card => card.column === column);
      const highestOrder = columnCards.reduce((max, card) => 
        Math.max(max, card.order || 0), -1);

      const newCard: CardType = {
        column,
        title: text.trim(),
        id: Math.random().toString(),
        order: highestOrder + 1,
        completed: false,
        createdBy: editorName.trim(),
        lastEditedBy: editorName.trim(),
        lastEditedTime: Date.now(),
        lastMovedTime: Date.now(),
        isArchived: false
      };

      // Return a properly typed array of CardType
      return [...prevCards, newCard] as CardType[];
    });

    setText("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <form onSubmit={handleSubmit} className="opacity-100 transition-opacity duration-200">
          {showNameInput ? (
            <input
              type="text"
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              autoFocus
              placeholder="Enter your name..."
              className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-2"
            />
          ) : (
            <textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
            />
          )}
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>Create Card</span>
              <FiPlus />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </button>
      )}
    </>
  );
};
