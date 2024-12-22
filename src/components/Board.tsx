import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { CardType } from "../types/CardType";
import { Column } from "./Column";
import { BurnBarrel } from "./BurnBarrel";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

export const Board = () => {
  const [cards, setCards] = useState<CardType[]>([]);

  // Initialize Firestore and set up real-time sync
  useEffect(() => {
    const cardsRef = collection(db, "cards");
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(cardsRef, async (snapshot) => {
      const cardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CardType[];
      
      // If collection is empty, initialize with default cards
      if (cardsData.length === 0) {
        const defaultCards = [
          { title: "SOX compliance checklist", id: "2", column: "backlog", order: 0 },
          { title: "Look into render bug in dashboard", id: "1", column: "backlog", order: 1 },
          { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog", order: 2 },
          { title: "Document Notifications service", id: "4", column: "backlog", order: 3 },
          { title: "Research DB options for new microservice", id: "5", column: "todo", order: 0 },
          { title: "Postmortem for outage", id: "6", column: "todo", order: 1 },
          { title: "Sync with product on Q3 roadmap", id: "7", column: "todo", order: 2 },
          { title: "Refactor context providers to use Zustand", id: "8", column: "doing", order: 0 },
          { title: "Add logging to daily CRON", id: "9", column: "doing", order: 1 },
          { title: "Set up DD dashboards for Lambda listener", id: "10", column: "done", order: 0 }
        ];

        // Add default cards to Firestore
        for (const card of defaultCards) {
          await setDoc(doc(cardsRef, card.id), {
            title: card.title,
            column: card.column,
            order: card.order
          });
        }
        
        // Cards will be loaded through the onSnapshot listener
        return;
      }
      
      // Sort cards by order within each column
      const sortedCardsData = cardsData.sort((a, b) => {
        if (a.column === b.column) {
          return (a.order || 0) - (b.order || 0);
        }
        return 0;
      });
      
      setCards(sortedCardsData);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Function to update cards in Firestore
  const handleSetCards: Dispatch<SetStateAction<CardType[]>> = async (newCardsOrUpdater) => {
    const newCards = typeof newCardsOrUpdater === 'function' 
      ? newCardsOrUpdater(cards)
      : newCardsOrUpdater;

    const cardsRef = collection(db, "cards");

    // Find cards that were removed
    const removedCards = cards.filter((card: CardType) => 
      !newCards.some((newCard: CardType) => newCard.id === card.id)
    );

    // Delete removed cards from Firestore
    for (const card of removedCards) {
      await deleteDoc(doc(db, "cards", card.id));
    }

    // Update or add cards in Firestore
    // First, recalculate order for cards in affected columns
    const cardsByColumn = newCards.reduce((acc, card) => {
      if (!acc[card.column]) acc[card.column] = [];
      acc[card.column].push(card);
      return acc;
    }, {} as Record<string, CardType[]>);

    // Sort and update order for each column
    Object.values(cardsByColumn).forEach(columnCards => {
      columnCards.sort((a, b) => (a.order || 0) - (b.order || 0));
      columnCards.forEach((card, index) => {
        card.order = index;
      });
    });

    // Update all cards in Firestore
    const updates = newCards.map(card => 
      setDoc(doc(cardsRef, card.id), {
        title: card.title,
        column: card.column,
        order: card.order
      })
    );

    // Wait for all updates to complete
    await Promise.all(updates).catch(console.error);
  };

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll px-12 py-6">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={handleSetCards}
      />
      <Column
        title="Low"
        column="todo"
        headingColor="text-blue-200"
        cards={cards}
        setCards={handleSetCards}
      />
      <Column
        title="Medium"
        column="doing"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={handleSetCards}
      />
      <Column
        title="High"
        column="done"
        headingColor="text-red-300"
        cards={cards}
        setCards={handleSetCards}
      />

      <BurnBarrel setCards={handleSetCards} />
    </div>
  );
};
