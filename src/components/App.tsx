import { motion } from "framer-motion";
import { Board } from "./Board";
import { Schedule } from "./Schedule";
import AppLogo from "./sharedComponents/AppLogo";
import { useState, useEffect } from "react";
import { CardType } from "../types/CardType";
import { collection, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [editorName, setEditorName] = useState("");

  // Keep track of the latest update timestamp and whether initial load is complete
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const cardsRef = collection(db, "cards");
    let timeoutId: NodeJS.Timeout;

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(cardsRef, async (snapshot) => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce updates to prevent rapid re-renders
      timeoutId = setTimeout(() => {
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

        // Get the latest timestamp from the snapshot
        const snapshotTime = Math.max(...snapshot.docs.map(doc => doc.data().lastEditedTime || 0));

        // Always update on initial load, then use timestamp check for subsequent updates
        if (isInitialLoad) {
          setCards(activeCards);
          setLastUpdateTime(snapshotTime);
          setIsInitialLoad(false);
        } else if (snapshotTime >= lastUpdateTime) {
          setCards(activeCards);
          setLastUpdateTime(snapshotTime);
        }
      }, 100); // Debounce time of 100ms
    });

    // Cleanup subscription and any pending timeout on unmount
    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Remove lastUpdateTime dependency since we handle it inside the effect

  // Function to handle card updates and sync with Firestore using batch writes
  const handleSetCards = async (updater: React.SetStateAction<CardType[]>) => {
    try {
      let updatedCards: CardType[];
      if (typeof updater === "function") {
        updatedCards = updater(cards);
      } else {
        updatedCards = updater;
      }

      // Sort cards by order within each column
      const sortedCards = [...updatedCards].sort((a, b) => 
        a.column === b.column ? (a.order || 0) - (b.order || 0) : 0
      );

      // Create a batch write
      const batch = writeBatch(db);
      const currentTime = Date.now();

      // Add all card updates to the batch
      sortedCards.forEach((card) => {
        const cardRef = doc(collection(db, "cards"), card.id);
        batch.set(cardRef, { ...card, lastEditedTime: currentTime });
      });

      // Commit the batch write
      await batch.commit();

      // Update the last update time
      setLastUpdateTime(currentTime);
      
      // Update local state
      setCards(sortedCards);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="appMax:flex appMax:justify-center"
      >
        <AppLogo />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center px-6 py-10 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none"
      >
        Upcoming Events
      </motion.h2>
      <Schedule setCards={handleSetCards} editorName={editorName} setEditorName={setEditorName} />

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center px-6 py-10 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none"
      >
        Project Priority
      </motion.h2>
      <Board cards={cards} setCards={handleSetCards} editorName={editorName} setEditorName={setEditorName} />
    </div>
  );
}

export default App;
