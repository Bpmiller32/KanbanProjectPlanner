import { useState, Dispatch, SetStateAction } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { CalendarEvent } from "../../types/CalendarEvent";
import { Utils } from "../Utils";
import { EventForm } from "./EventForm";
import { Button } from "../sharedComponents/Button";
import { AnimatePresence, motion } from "framer-motion";
import { CardType } from "../../types/CardType";

interface EventsProps {
  events: CalendarEvent[];
  setCards: (updater: SetStateAction<CardType[]>) => Promise<void>;
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
  currentMonth: string;
}

export const EventsList = ({
  events,
  setCards,
  editorName,
  setEditorName,
}: EventsProps) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent>>({
    date: Utils.getTodayDate(),
    title: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [pendingBoardEvent, setPendingBoardEvent] =
    useState<CalendarEvent | null>(null);

  // Function to show event form
  const handleShowEventForm = () => {
    if (!editorName.trim()) {
      setShowNameInput(true);
    } else {
      setShowEventForm(true);
    }
  };

  // Function to add event to priority board
  const handleAddToPriorityBoard = async (event: CalendarEvent) => {
    console.log("Adding to priority board:", event);

    // Check if the editor's name is provided, if not show the name input field
    if (!editorName.trim()) {
      setPendingBoardEvent(event);
      setShowNameInput(true);
      return;
    }

    try {
      // Create new card reference
      const newCardRef = doc(collection(db, "cards"));

      // Get all existing cards to find the lowest order
      const cardsSnapshot = await getDocs(collection(db, "cards"));
      const existingCards = cardsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CardType[];

      // Find the lowest order in the backlog column
      const backlogCards = existingCards.filter(
        (card) => card.column === "backlog" && !card.isArchived
      );
      const lowestOrder =
        backlogCards.length > 0
          ? Math.min(...backlogCards.map((card) => card.order || 0))
          : 0;

      // Create new card with order lower than the lowest existing order
      const newOrder = lowestOrder - 1000; // Ensure significant gap between orders

      // Create new card
      const newCard: CardType = {
        id: newCardRef.id,
        title: event.title,
        column: "backlog",
        order: newOrder,
        completed: false,
        createdBy: event.createdBy || editorName.trim(),
        createdAt: Date.now(),
        lastEditedBy: editorName.trim(),
        lastEditedTime: Date.now(),
        lastMovedTime: Date.now(),
        isArchived: false,
      };

      // Add to Firestore first
      await setDoc(newCardRef, newCard);

      // Then update state with a stable sort
      await setCards((prevCards) => {
        const newCards = [...prevCards, newCard];
        return newCards.sort((a, b) => {
          if (a.column !== b.column) {
            return 0; // Keep cards in their columns
          }
          // For same column, sort by order and then by creation time for stability
          if (a.order === b.order) {
            return (b.createdAt || 0) - (a.createdAt || 0);
          }
          return (a.order || 0) - (b.order || 0);
        });
      });
    } catch (error) {
      console.error("Error adding card to priority board:", error);
    }
  };

  /* --------------------------------- Events --------------------------------- */
  // Start editing an event
  const handleEditButtonClicked = (event: CalendarEvent) => {
    // If no name is set, show name input first
    if (!editorName.trim()) {
      setEditingEvent(event);
      setIsEditing(true);
      setShowNameInput(true);
      return;
    }
    setEditingEvent(event);
    setIsEditing(true);
    setShowEventForm(true);
  };

  // Archives an event by setting its "isArchived" property to true
  const handleArchiveButtonClicked = async (eventId: string) => {
    try {
      // Reference to the "events" collection in Firestore
      const eventsRef = collection(db, "events");

      // Fetch the document to get the event data
      const eventDoc = await getDoc(doc(eventsRef, eventId));
      if (!eventDoc.exists()) {
        throw new Error("document doesn't exist in Firebase");
      }

      // Check the title and decide to delete or archive, delete the event if the title is "unnamed event"
      if (eventDoc.data().title === "unnamed event") {
        await deleteDoc(doc(eventsRef, eventId));
      } else {
        await setDoc(
          doc(eventsRef, eventId),
          {
            isArchived: true,
            lastUpdated: Date.now(),
          },
          { merge: true } // Merge the new fields with the existing document instead of overwriting it
        );
      }
    } catch (error) {
      console.error("Error archiving event:", error);
    }
  };

  /* --------------------------------- Helpers -------------------------------- */
  // Handle name submission
  const handleNameSubmit = async () => {
    console.log("Name submitted", { editorName, pendingBoardEvent, isEditing });

    if (!editorName.trim()) return;

    if (pendingBoardEvent) {
      console.log("Adding to board after name submit");
      const eventToAdd = pendingBoardEvent;
      setPendingBoardEvent(null);
      setShowNameInput(false);
      await handleAddToPriorityBoard(eventToAdd);
    } else {
      console.log("Showing form after name submit");
      setShowNameInput(false);
      setShowEventForm(true);
    }
  };

  // Handles the submission of the event form
  const handleEventSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted", { showNameInput, editorName });

    if (showNameInput) {
      await handleNameSubmit();
      return;
    }

    // Ensure the event has both a title and a date before proceeding
    if (!editingEvent.title || !editingEvent.date) {
      return;
    }

    try {
      // Reference to the events collection in Firestore
      const eventsRef = collection(db, "events");

      // Prepare the event data to save, including the last updated timestamp and the editor's name
      const eventData = {
        ...editingEvent,
        lastUpdated: Date.now(),
        lastEditedBy: editorName.trim(),
      };

      // If editing an existing event and an event ID is provided, update the existing event in Firestore
      if (isEditing && editingEvent.id) {
        await setDoc(doc(eventsRef, editingEvent.id), eventData);
        resetFormState(false);
      }
      // Otherwise adding a new event, create a new document in Firestore with the event data
      else {
        const newDocRef = doc(eventsRef);
        const newEventData = {
          ...eventData,
          id: newDocRef.id,
          createdAt: Date.now(),
          createdBy: editorName.trim(),
        };
        await setDoc(newDocRef, newEventData);
        resetFormState(false);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  // Reset form state
  const resetFormState = (clearName: boolean = false) => {
    setShowEventForm(false);
    setIsEditing(false);
    setShowNameInput(false);
    setPendingBoardEvent(null);
    setEditingEvent({ date: Utils.getTodayDate(), title: "" });

    if (clearName) {
      setEditorName("");
    }
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base font-semibold text-gray-100 cursor-default"
        >
          Events List
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            text="Add event"
            onClick={() => {
              resetFormState(false);
              handleShowEventForm();
            }}
          />
        </motion.div>
      </div>

      {/* Event Form */}
      <AnimatePresence mode="wait">
        {(showEventForm || showNameInput) && (
          <EventForm
            isEditing={isEditing}
            showNameInput={showNameInput}
            editorName={editorName}
            editingEvent={editingEvent}
            onNameChange={setEditorName}
            onEventChange={(field, value) =>
              setEditingEvent((prev) => ({ ...prev, [field]: value }))
            }
            onCancel={() => resetFormState(true)}
            onSubmit={handleEventSubmit}
          />
        )}
      </AnimatePresence>

      {/* Events List Container */}
      <div className="mt-2 relative bg-neutral-800 rounded-lg">
        <ol className="text-sm/6 text-gray-400 max-h-[275px] min-h-[275px] overflow-y-auto pr-4 pl-2 py-2 relative">
          {events.length === 0 ? (
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full text-gray-500"
            >
              No events yet. Click "Add event" or a date in the calendar to
              create one.
            </motion.li>
          ) : (
            events.map((event, index) => (
              <AnimatePresence key={event.id}>
                <motion.li
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="py-4 sm:flex items-center"
                >
                  {/* Date of the event */}
                  <time
                    dateTime={event.date}
                    className="flex justify-center w-full sm:w-28 sm:block"
                  >
                    {Utils.formatEventDate(event.date)}
                  </time>

                  {/* Event details */}
                  <div className="mt-2 flex-auto sm:mt-0">
                    {/* Event title */}
                    <p className="font-semibold text-gray-100 flex justify-center w-full sm:block">
                      {event.title}
                    </p>

                    {/* Additional information about the event */}
                    {event.title !== "unnamed event" && (
                      <p className="text-xs text-gray-400 flex justify-center w-full sm:block">
                        {event.lastEditedBy &&
                        event.lastEditedBy !== event.createdBy
                          ? `Last edited by ${event.lastEditedBy}`
                          : `Created by ${event.createdBy}`}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 py-2 justify-center mt-2 sm:mt-0">
                    <Button
                      text="Edit"
                      onClick={() => handleEditButtonClicked(event)}
                      bgColor="blue"
                    />
                    <Button
                      text="Add to Priority Board"
                      onClick={() => handleAddToPriorityBoard(event)}
                      bgColor="indigo"
                    />
                    <Button
                      text="Archive"
                      onClick={() => handleArchiveButtonClicked(event.id)}
                      bgColor="red"
                    />
                  </div>
                </motion.li>

                {/* Dividing bar between events */}
                {index < events.length - 1 && (
                  <motion.div
                    key={`divider-${event.id}`}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                    className="h-[1px] bg-gray-200 origin-center"
                  />
                )}
              </AnimatePresence>
            ))
          )}
        </ol>
      </div>
    </section>
  );
};
