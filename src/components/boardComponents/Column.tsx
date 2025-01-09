import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CardType } from "../../types/CardType";
import { Card } from "./Card";
import { DropIndicator } from "./DropIndicator";
import { AddCard } from "./AddCard";

interface ColumnProps {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: string;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
}

export const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  editorName,
  setEditorName,
}: ColumnProps) => {
  // States to track whether the column is active (highlighted) during drag-over, weather a card is currently being dragged
  const [active, setActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Function to clear all DropIndicator highlights in this column
  const clearHighlights = useCallback(() => {
    document
      .querySelectorAll(`[data-column="${column}"] [data-indicator-line]`)
      .forEach((line) => {
        // Hides the DropIndicator line
        if (line instanceof HTMLElement) {
          line.style.opacity = "0";
        }
      });
  }, [column]);

  // Finds the DropIndicator closest to the mouse cursor
  const getNearestIndicator = (
    event: React.DragEvent<HTMLDivElement>
  ): HTMLElement | null => {
    // Select all DropIndicators in this column
    const indicators = document.querySelectorAll<HTMLElement>(
      `[data-column="${column}"][data-type="drop-indicator"]`
    );

    let closestIndicator: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    // Loop through each indicator and find the one closest to the cursor
    indicators.forEach((indicator: HTMLElement) => {
      const rect = indicator.getBoundingClientRect();
      const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndicator = indicator;
      }
    });

    return closestIndicator;
  };

  // Called when a drag operation starts on a card
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    card: CardType
  ) => {
    // Store the dragged card's ID in the drag event, indicate that a card is being dragged
    event.dataTransfer.setData("cardId", card.id);
    setIsDragging(true);
  };

  // Called when a dragged item is moved over the column
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Allow drop actions, highlight the column
    event.preventDefault();
    setActive(true);

    // Find the nearest DropIndicator and show its highlight
    const indicator = getNearestIndicator(event);
    if (indicator) {
      const line = indicator.querySelector("[data-indicator-line]");

      // Highlight the nearest DropIndicator
      if (line instanceof HTMLElement) {
        line.style.opacity = "1";
      }
    }
  };

  // Called when a dragged item leaves the column
  const handleDragLeave = () => {
    // Remove column highlight, clear any visible DropIndicator highlights
    setActive(false);
    clearHighlights();
  };

  // Called when a dragged item is dropped into the column
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setActive(false);
    setIsDragging(false);
    clearHighlights();

    const cardId = event.dataTransfer.getData("cardId");
    const indicator = getNearestIndicator(event);

    if (!indicator) return;

    // Get the ID of the card before which the dropped card should be inserted, find the dragged card in the list
    const beforeId = indicator.dataset.before || "";
    const cardToMove = cards.find((card) => card.id === cardId);

    // Ignore invalid drop actions
    if (!cardToMove || beforeId === cardId) {
      return;
    }

    // Update the card list with the new order
    setCards((prev) => {
      // Remove the card being moved from its current position
      const withoutMovedCard = prev.filter((c) => c.id !== cardId);

      // Get all cards in this column and sort them by their order
      const columnCards = withoutMovedCard
        .filter((c) => c.column === column)
        .sort((a, b) => a.order - b.order);

      // Determine the new position of the dragged card
      let position;
      if (beforeId === "top") {
        position = 0; // Insert at the beginning
      } else if (beforeId === "bottom") {
        position = columnCards.length; // Insert at the end
      } else {
        position = columnCards.findIndex((c) => c.id === beforeId);

        // Default to the end if not found
        if (position === -1) {
          position = columnCards.length;
        }
      }

      // Insert the card at the calculated position
      columnCards.splice(position, 0, {
        ...cardToMove,
        column, // Update the card's column
        lastMovedTime: Date.now(),
      });

      // Normalize the order values for all cards in the column
      const updatedColumnCards = columnCards.map((card, index) => ({
        ...card,
        order: (index + 1) * 1000, // Set orders to ensure proper sorting
      }));

      // Merge the updated column cards with the rest of the cards
      return prev.map(
        (card) =>
          updatedColumnCards.find((c) => c.id === card.id) ||
          (card.id !== cardId ? card : { ...card, column })
      );
    });
  };

  // Adds event listeners to reset drag state on drag end or mouse leave
  useEffect(() => {
    const resetDragState = () => {
      // Clear dragging state, remove column hightlight, clear all DropIndicator highlights
      setIsDragging(false);
      setActive(false);
      clearHighlights();
    };

    window.addEventListener("dragend", resetDragState);
    window.addEventListener("mouseleave", resetDragState);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("dragend", resetDragState);
      window.removeEventListener("mouseleave", resetDragState);
    };
  }, [clearHighlights]);

  // Filter cards for this column (excluding archived) and sort them by their order
  const columnCards = cards
    .filter((card) => card.column === column && !card.isArchived)
    .sort((a, b) => a.order - b.order);

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div className="w-56 shrink-0">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {columnCards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {/* Render cards and DropIndicators */}
        {columnCards.map((card, index) => (
          <React.Fragment key={card.id}>
            {index === 0 && (
              <DropIndicator beforeId={card.id} column={column} />
            )}
            <Card
              {...card}
              handleDragStart={handleDragStart}
              isDragging={isDragging}
              setCards={setCards}
              editorName={editorName}
              setEditorName={setEditorName}
            />
            <DropIndicator
              beforeId={columnCards[index + 1]?.id}
              column={column}
            />
          </React.Fragment>
        ))}
        {columnCards.length === 0 && (
          <DropIndicator beforeId={null} column={column} />
        )}

        {/* Add card button */}
        <AddCard
          column={column}
          setCards={setCards}
          editorName={editorName}
          setEditorName={setEditorName}
        />
      </div>
    </div>
  );
};
