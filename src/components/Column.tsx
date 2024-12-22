import React, { Dispatch, SetStateAction, useState } from "react";
import { CardType } from "../types/CardType";
import { ColumnType } from "../types/ColumnType";
import { Card } from "./Card";
import { DropIndicator } from "./DropIndicator";
import { AddCard } from "./AddCard";

interface ColumnProps {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
}: ColumnProps) => {
  const [active, setActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
    setIsDragging(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  // Reset active state for all columns
  const resetAllColumns = () => {
    document.querySelectorAll('.column-drop-zone').forEach(zone => {
      (zone as HTMLElement).classList.remove('bg-neutral-800/50');
      (zone as HTMLElement).classList.add('bg-neutral-800/0');
    });
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const getNearestIndicator = (e: React.DragEvent<HTMLDivElement>, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const calculateNewOrder = (
    columnCards: CardType[],
    beforeCard: CardType | null,
    afterCard: CardType | null
  ): number => {
    if (!beforeCard && !afterCard) return 1;
    if (!beforeCard) return afterCard!.order / 2;
    if (!afterCard) return beforeCard.order + 1;
    return beforeCard.order + (afterCard.order - beforeCard.order) / 2;
  };

  const handleDragEnd = async (e: React.DragEvent<HTMLDivElement>) => {
    try {
      const cardId = e.dataTransfer.getData("cardId");

      setActive(false);
      setIsDragging(false);
      clearHighlights();
      resetAllColumns();

      const indicators = getIndicators();
      const { element } = getNearestIndicator(e, indicators);
      const before = element.dataset.before || "-1";

      if (before !== cardId) {
        // Find the card being moved
        const cardToMove = cards.find((c) => c.id === cardId);
        if (!cardToMove) return;

        // Get cards in the target column
        const columnCards = cards
          .filter(c => c.column === column)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Find surrounding cards for order calculation
        const insertIndex = before === "-1" ? columnCards.length : 
          columnCards.findIndex(c => c.id === before);
        
        const beforeCard = insertIndex > 0 ? columnCards[insertIndex - 1] : null;
        const afterCard = insertIndex < columnCards.length ? columnCards[insertIndex] : null;
        
        // Calculate new order
        const newOrder = calculateNewOrder(columnCards, beforeCard, afterCard);

        // Create new cards array with updated card
        const newCards = cards.map(c => 
          c.id === cardId 
            ? { ...c, column, order: newOrder }
            : c
        );

        // Let Firestore handle the update and UI refresh
        await setCards(newCards);
      }
    } catch (error) {
      console.error('Failed to update card position:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const highlightIndicator = (e: React.DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  // Reset state when drag is cancelled or mouse leaves window
  React.useEffect(() => {
    const handleDragEnd = () => {
      setIsDragging(false);
      setActive(false);
      clearHighlights();
      resetAllColumns();
    };

    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('mouseleave', handleDragEnd);

    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('mouseleave', handleDragEnd);
    };
  }, []);

  const filteredCards = cards
    .filter((c) => c.column === column)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors column-drop-zone ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} isDragging={isDragging} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};
