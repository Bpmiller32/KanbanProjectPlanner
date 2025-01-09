import { useEffect, useState, SetStateAction } from "react";
import { CardType } from "../types/CardType";
import { Column } from "./boardComponents/Column";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { ColumnType } from "../types/ColumnType";

export const Board = () => {
  // State to store current list of cards, name of the current editor
  const [cards, setCards] = useState<CardType[]>([]);
  const [editorName, setEditorName] = useState("");

  useEffect(() => {
    const cardsRef = collection(db, "cards");

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(cardsRef, async (snapshot) => {
      // Map Firestore documents to CardType objects
      const cardsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CardType[];

      // Filter out archived cards and sort by column and order
      const activeCards = cardsData
        .filter((card) => !card.isArchived)
        .sort((a, b) =>
          a.column === b.column ? (a.order || 0) - (b.order || 0) : 0
        );

      // Update the cards state with the active cards
      setCards(activeCards);
    });

    // Cleanup subscription on unmount to prevent memory leaks
    return () => unsubscribe();
  }, []);

  // Function to handle card updates and sync with Firestore, passed into Column
  const handleSetCards = async (updater: SetStateAction<CardType[]>) => {
    let updatedCards: CardType[];
    if (typeof updater === "function") {
      // Call the updater function with the current state
      updatedCards = updater(cards);
    } else {
      // Use updater directly as it's already an array
      updatedCards = updater;
    }

    // Organize cards by column and recalculate order
    const organizedCards = organizeCardsByColumn(updatedCards);

    // Update each card in Firestore, update the local state with organized cards
    try {
      await Promise.all(
        organizedCards.map((card) =>
          setDoc(doc(collection(db, "cards"), card.id), card)
        )
      );

      setCards(organizedCards);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  // Helper to sort cards by column and recalculate order
  const organizeCardsByColumn = (cards: CardType[]) => {
    // Group cards by their column
    const cardsByColumn: { [key: string]: CardType[] } = {};
    for (const card of cards) {
      // Initialize the array for this column if it doesn't exist
      if (!cardsByColumn[card.column]) {
        cardsByColumn[card.column] = [];
      }
      // Add the card to the corresponding column
      cardsByColumn[card.column].push(card);
    }

    // Sort cards in each column and normalize their order property while preserving spacing
    Object.values(cardsByColumn).forEach((columnCards) => {
      const sortedCards = columnCards.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      // Only reorder if there are gaps larger than 100000 or negative/zero numbers
      let needsReorder = false;
      for (let i = 0; i < sortedCards.length; i++) {
        const card = sortedCards[i];

        // Check if the first card has an invalid order
        if (i === 0 && card.order <= 0) {
          needsReorder = true;
          break;
        }

        // Skip the first card for gap calculation
        if (i > 0) {
          const previousCard = sortedCards[i - 1];
          const gap = card.order - previousCard.order;

          // Check if the gap is too large or non-positive
          if (gap > 100000 || gap <= 0) {
            needsReorder = true;
            break;
          }
        }
      }

      // Use larger gaps (10000) when reordering to prevent frequent reorders
      if (needsReorder) {
        sortedCards.forEach((card, index) => {
          card.order = (index + 1) * 10000;
        });
      }
    });

    return cards;
  };

  const boardColumns: ColumnType[] = [
    { title: "Backlog", column: "backlog", color: "text-neutral-500" },
    { title: "Low", column: "todo", color: "text-blue-200" },
    { title: "Medium", column: "doing", color: "text-yellow-200" },
    { title: "High", column: "done", color: "text-red-300" },
  ];

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div className="flex justify-center h-full w-full gap-3 px-6">
      {boardColumns.map(({ title, column, color }) => (
        <Column
          key={column}
          title={title}
          column={column}
          headingColor={color}
          cards={cards}
          setCards={handleSetCards}
          editorName={editorName}
          setEditorName={setEditorName}
        />
      ))}
    </div>
  );
};
