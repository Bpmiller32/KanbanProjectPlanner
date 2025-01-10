import { motion } from "framer-motion";
import { Board } from "./Board";
import { Schedule } from "./Schedule";
import AppLogo from "./sharedComponents/AppLogo";
import { useState, useEffect } from "react";
import { CardType } from "../types/CardType";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function App() {
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to handle card updates and sync with Firestore
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

      // Update each card in Firestore
      await Promise.all(
        sortedCards.map((card) =>
          setDoc(doc(collection(db, "cards"), card.id), card)
        )
      );

      setCards(sortedCards);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  return (
    <>
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
    </>
  );
}

export default App;
