import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { ColumnType } from "../../types/ColumnType";
import { CardType } from "../../types/CardType";
import { FiPlus } from "react-icons/fi";

type AddCardProps = {
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
};

export const AddCard = ({
  column,
  setCards,
  editorName,
  setEditorName,
}: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text.trim().length) return;

    // If we have a name, create the card
    if (editorName.trim()) {
      createCard();
      return;
    }

    // If no name and not showing name input yet, show it
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    // If showing name input and name is still empty, do nothing
    if (!editorName.trim()) return;

    // If we have both text and name, create the card
    createCard();
  };

  const createCard = () => {
    setCards((prevCards) => {
      // Find the highest order in the target column
      const columnCards = prevCards.filter((card) => card.column === column);
      const highestOrder = columnCards.reduce(
        (max, card) => Math.max(max, card.order || 0),
        -1
      );

      const newCard: CardType = {
        column,
        title: text.trim(),
        id: Math.random().toString(),
        order: highestOrder + 1,
        completed: false,
        createdBy: editorName.trim(),
        createdAt: Date.now(),
        lastEditedBy: editorName.trim(),
        lastEditedTime: Date.now(),
        lastMovedTime: Date.now(),
        isArchived: false,
      };

      return [...prevCards, newCard] as CardType[];
    });

    setText("");
    setAdding(false);
    setShowNameInput(false);
  };

  const handleClose = () => {
    setAdding(false);
    setShowNameInput(false);
    setText("");
  };

  const handleAddClick = () => {
    setAdding(true);
    setShowNameInput(false);
  };

  return (
    <>
      {adding ? (
        <form
          onSubmit={handleSubmit}
          className="opacity-100 transition-opacity duration-200"
        >
          {showNameInput ? (
            <div>
              <textarea
                value={text}
                readOnly
                className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 mb-2 opacity-50"
              />
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                autoFocus
                placeholder="Enter your name..."
                className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
              />
            </div>
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
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span>{showNameInput ? "Save" : "Create Card"}</span>
              <FiPlus />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={handleAddClick}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </button>
      )}
    </>
  );
};
