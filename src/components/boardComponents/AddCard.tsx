import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { CardType } from "../../types/CardType";
import { FiPlus } from "react-icons/fi";

type AddCardProps = {
  column: string;
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
  // State for text content of the new card, whether the card creation form is visible, whether to show the name input field
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  /* --------------------------------- Events --------------------------------- */
  // Handles form submission for creating a new card
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Ensure card text is not empty
    if (!text.trim()) {
      return;
    }

    // Show name input if the editor's name is not set
    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    // Create the card if text and editor name are available
    createCard();
  };

  // Creates a new card and updates the state
  const createCard = () => {
    setCards((prevCards) => {
      // Find the highest order number in the current column
      const highestOrder = prevCards
        .filter((card) => card.column === column)
        .reduce((max, card) => Math.max(max, card.order || 0), -1);

      // Define the new card properties
      const newCard: CardType = {
        column,
        title: text.trim(),
        id: Math.random().toString(), // Unique identifier
        order: highestOrder + 1, // Next order value
        completed: false,
        createdBy: editorName.trim(),
        createdAt: Date.now(),
        lastEditedBy: editorName.trim(),
        lastEditedTime: Date.now(),
        lastMovedTime: Date.now(),
        isArchived: false,
      };

      return [...prevCards, newCard];
    });

    // Reset the form state
    setText("");
    setAdding(false);
    setShowNameInput(false);
  };

  // Closes the add card form and resets relevant states
  const handleCloseClicked = () => {
    setAdding(false);
    setShowNameInput(false);
    setText("");
  };

  // Opens the add card form
  const handleAddClicked = () => {
    setAdding(true);
    setShowNameInput(false);
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <>
      {adding ? (
        <form
          onSubmit={handleSubmit}
          className="opacity-100 transition-opacity duration-200"
        >
          {showNameInput ? (
            // Render name input field if it's required
            <div>
              <textarea
                value={text}
                readOnly
                className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 mb-2 opacity-50"
              />
              <input
                type="text"
                value={editorName}
                onChange={(event) => setEditorName(event.target.value)}
                autoFocus
                placeholder="Enter your name..."
                className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
              />
            </div>
          ) : (
            // Render card text input field
            <textarea
              onChange={(event) => setText(event.target.value)}
              value={text}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
            />
          )}
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={handleCloseClicked}
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
        // Button to open the add card form
        <button
          onClick={handleAddClicked}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </button>
      )}
    </>
  );
};
