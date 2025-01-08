import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { CardType } from "../types/CardType";
import { Column } from "./Column";
import { BurnBarrel } from "./BurnBarrel";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

export const Board = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [editorName, setEditorName] = useState("");

  // Initialize Firestore and set up real-time sync
  useEffect(() => {
    const cardsRef = collection(db, "cards");

    // Set up real-time listener
    const unsubscribe = onSnapshot(cardsRef, async (snapshot) => {
      const cardsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CardType[];

      // If collection is empty, initialize with default cards
      if (cardsData.length === 0) {
        const defaultCards = [
          {
            title: "SOX compliance checklist",
            id: "2",
            column: "backlog",
            order: 0,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Look into render bug in dashboard",
            id: "1",
            column: "backlog",
            order: 1,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "[SPIKE] Migrate to Azure",
            id: "3",
            column: "backlog",
            order: 2,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Document Notifications service",
            id: "4",
            column: "backlog",
            order: 3,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Research DB options for new microservice",
            id: "5",
            column: "todo",
            order: 0,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Postmortem for outage",
            id: "6",
            column: "todo",
            order: 1,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Sync with product on Q3 roadmap",
            id: "7",
            column: "todo",
            order: 2,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Refactor context providers to use Zustand",
            id: "8",
            column: "doing",
            order: 0,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Add logging to daily CRON",
            id: "9",
            column: "doing",
            order: 1,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
          {
            title: "Set up DD dashboards for Lambda listener",
            id: "10",
            column: "done",
            order: 0,
            completed: false,
            createdBy: "System",
            createdAt: Date.now(),
            lastEditedBy: "System",
            lastEditedTime: Date.now(),
            lastMovedTime: Date.now(),
            isArchived: false,
          },
        ];

        // Add default cards to Firestore
        for (const card of defaultCards) {
          await setDoc(doc(cardsRef, card.id), {
            title: card.title,
            column: card.column,
            order: card.order,
            completed: card.completed || false,
            createdBy: card.createdBy,
            createdAt: card.createdAt || Date.now(),
            lastEditedBy: card.lastEditedBy,
            lastEditedTime: card.lastEditedTime,
            lastMovedTime: card.lastMovedTime,
            isArchived: card.isArchived,
          });
        }

        // Cards will be loaded through the onSnapshot listener
        return;
      }

      // Sort cards by order within each column
      // Filter out archived cards and sort the rest
      const sortedCardsData = cardsData
        .filter((card) => !card.isArchived)
        .sort((a, b) => {
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
  const handleSetCards: Dispatch<SetStateAction<CardType[]>> = async (
    newCardsOrUpdater
  ) => {
    const newCards =
      typeof newCardsOrUpdater === "function"
        ? newCardsOrUpdater(cards)
        : newCardsOrUpdater;

    const cardsRef = collection(db, "cards");

    // Update or add cards in Firestore
    // First, recalculate order for cards in affected columns
    const cardsByColumn = newCards.reduce((acc, card) => {
      if (!acc[card.column]) acc[card.column] = [];
      acc[card.column].push(card);
      return acc;
    }, {} as Record<string, CardType[]>);

    // Sort and update order for each column
    Object.values(cardsByColumn).forEach((columnCards) => {
      columnCards.sort((a, b) => (a.order || 0) - (b.order || 0));
      columnCards.forEach((card, index) => {
        card.order = index;
      });
    });

    // Update all cards in Firestore
    const updates = newCards.map((card) => {
      const cardData = {
        title: card.title,
        column: card.column,
        order: card.order,
        completed: card.completed || false,
        createdBy: card.createdBy || "Unknown",
        createdAt: card.createdAt || Date.now(),
        lastEditedBy: card.lastEditedBy || card.createdBy || "Unknown",
        // Only update lastEditedTime if the card was modified or it's missing
        lastEditedTime: card.lastEditedTime || Date.now(),
        lastMovedTime: card.lastMovedTime || Date.now(),
        isArchived: card.isArchived || false,
      };
      return setDoc(doc(cardsRef, card.id), cardData);
    });

    // Wait for all updates to complete
    await Promise.all(updates).catch(console.error);
  };

  return (
    <div className="flex h-full w-full gap-3 px-12 py-6">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={handleSetCards}
        editorName={editorName}
        setEditorName={setEditorName}
      />
      <Column
        title="Low"
        column="todo"
        headingColor="text-blue-200"
        cards={cards}
        setCards={handleSetCards}
        editorName={editorName}
        setEditorName={setEditorName}
      />
      <Column
        title="Medium"
        column="doing"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={handleSetCards}
        editorName={editorName}
        setEditorName={setEditorName}
      />
      <Column
        title="High"
        column="done"
        headingColor="text-red-300"
        cards={cards}
        setCards={handleSetCards}
        editorName={editorName}
        setEditorName={setEditorName}
      />

      <BurnBarrel setCards={handleSetCards} />
    </div>
  );
};
