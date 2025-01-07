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
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  editorName,
  setEditorName,
}: ColumnProps) => {
  const [active, setActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
    setIsDragging(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((indicator) => {
      const line = indicator.querySelector('[data-indicator-line]');
      if (line instanceof HTMLElement) {
        line.style.opacity = "0";
      }
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
    // Get the cursor position relative to the container
    const mouseY = e.clientY;

    // Find the closest indicator by comparing the cursor position with the middle point of each gap
    let closestIndicator = indicators[indicators.length - 1];
    let closestDistance = Number.POSITIVE_INFINITY;

    indicators.forEach((indicator) => {
      const box = indicator.getBoundingClientRect();
      const centerY = box.top;
      const distance = Math.abs(mouseY - centerY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndicator = indicator;
      }
    });

    return {
      element: closestIndicator,
      offset: mouseY - closestIndicator.getBoundingClientRect().top
    };
  };

  const calculateNewOrder = (
    columnCards: CardType[],
    beforeCard: CardType | null,
    afterCard: CardType | null
  ): number => {
    if (!beforeCard && !afterCard) return 0;
    if (!beforeCard) return afterCard!.order - 1;
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

        // Calculate and apply the move immediately
        const columnCards = cards
          .filter(c => c.column === column)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const insertIndex = before === "-1" ? columnCards.length : 
          columnCards.findIndex(c => c.id === before);
        
        const beforeCard = insertIndex > 0 ? columnCards[insertIndex - 1] : null;
        const afterCard = insertIndex < columnCards.length ? columnCards[insertIndex] : null;
        
        const newOrder = calculateNewOrder(columnCards, beforeCard, afterCard);

        setCards(prevCards =>
          prevCards.map(c =>
            c.id === cardId
              ? {
                  ...c,
                  column,
                  order: newOrder,
                  lastMovedTime: Date.now()
                }
              : c
          )
        );
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
    const line = el.element.querySelector('[data-indicator-line]');
    if (line instanceof HTMLElement) {
      line.style.opacity = "1";
    }
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
          return (
            <Card 
              key={c.id} 
              {...c} 
              handleDragStart={handleDragStart} 
              isDragging={isDragging} 
              setCards={setCards}
              editorName={editorName}
              setEditorName={setEditorName}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
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
