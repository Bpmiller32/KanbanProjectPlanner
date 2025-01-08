import { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { CalendarEvent } from "../../types/CalendarEvent";
import { Utils } from "../Utils";
import { EventForm } from "./EventForm";
import { Button } from "../sharedComponents/Button";
import { AnimatePresence, motion } from "framer-motion";

interface EventsProps {
  events: CalendarEvent[];
}

export const EventsList = ({ events }: EventsProps) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editorName, setEditorName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent>>({
    date: Utils.getTodayDate(),
    title: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  /* --------------------------------- Events --------------------------------- */
  // Start editing an event
  const handleEditButtonClicked = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEditing(true);
    setShowEventForm(true);
  };

  // Archives an event by setting its "isArchived" property to true
  const handleArchiveButtonClicked = async (eventId: string) => {
    try {
      // Reference to the "events" collection in Firestore
      const eventsRef = collection(db, "events");

      // Update the specified event document in Firestore
      await setDoc(
        doc(eventsRef, eventId), // Reference the event document by its ID
        {
          isArchived: true, // Mark the event as archived
          lastUpdated: Date.now(), // Set the current timestamp as the last updated time
        },
        { merge: true } // Merge the new fields with the existing document instead of overwriting it
      );
    } catch (error) {
      console.error("Error archiving event:", error);
    }
  };

  /* --------------------------------- Helpers -------------------------------- */
  // Handles the submission of the event form
  const handleEventSubmit = async (event: React.FormEvent) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Ensure the event has both a title and a date before proceeding
    if (!editingEvent.title || !editingEvent.date) {
      return;
    }

    // Check if the editor's name is provided, if not show the name input field
    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    try {
      // Reference to the events collection in Firestore
      const eventsRef = collection(db, "events");

      // Prepare the event data to save, including the last updated timestamp and the editor's name
      const eventData = {
        ...editingEvent, // Spread existing event details
        lastUpdated: Date.now(), // Timestamp for the last update
        lastEditedBy: editorName.trim(), // Trimmed editor's name
      };

      // If editing an existing event and an event ID is provided, update the existing event in Firestore
      if (isEditing && editingEvent.id) {
        await setDoc(doc(eventsRef, editingEvent.id), eventData);
      }
      // Otherwise adding a new event, create a new document in Firestore with the event data
      else {
        await setDoc(doc(eventsRef), {
          ...eventData, // Include existing event details
          createdAt: Date.now(), // Timestamp for when the event is created
          createdBy: editorName.trim(), // Trimmed creator's name
        });
      }

      // Reset the form state to clear inputs and hide the form after submission
      resetFormState();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  // Reset form state
  const resetFormState = () => {
    setShowEventForm(false);
    setIsEditing(false);
    setShowNameInput(false);
    setEditingEvent({ date: Utils.getTodayDate(), title: "" });
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base font-semibold text-gray-100"
        >
          Events List
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            text="Add event"
            onClick={() => {
              resetFormState();
              setShowEventForm(!showEventForm);
            }}
          />
        </motion.div>
      </div>

      {/* Event Form */}
      {showEventForm && (
        <EventForm
          isEditing={isEditing}
          showNameInput={showNameInput}
          editorName={editorName}
          editingEvent={editingEvent}
          onNameChange={setEditorName}
          onEventChange={(field, value) =>
            setEditingEvent((prev) => ({ ...prev, [field]: value }))
          }
          onCancel={resetFormState}
          onSubmit={handleEventSubmit}
        />
      )}

      {/* Events List */}
      <ol className="mt-2 text-sm/6 text-gray-400">
        {events.map((event, index) => (
          <AnimatePresence key={event.id}>
            <motion.li
              initial={{ opacity: 0, y: -10 }} // Fade in and slide up
              animate={{ opacity: 1, y: 0 }} // Fully visible
              transition={{ duration: 0.5 }}
              className="py-4 sm:flex items-center"
            >
              {/* Date of the event */}
              <time dateTime={event.date} className="w-28 flex-none">
                {Utils.formatEventDate(event.date)}
              </time>

              {/* Event details */}
              <div className="mt-2 flex-auto sm:mt-0">
                {/* Event title */}
                <p className="font-semibold text-gray-100">{event.title}</p>

                {/* Additional information about the event, shown only if the title is not "unnamed event" */}
                {event.title !== "unnamed event" && (
                  <p className="text-xs text-gray-400">
                    Created by {event.createdBy}
                    {/* Show "Last edited by" only if the editor is different from the creator */}
                    {event.lastEditedBy !== event.createdBy &&
                      ` • Last edited by ${event.lastEditedBy}`}
                  </p>
                )}
              </div>

              {/* Action buttons for editing or archiving the event */}
              <div className="flex gap-2 ml-4"></div>
              <div className="flex gap-2 ml-4">
                <Button
                  text="Edit"
                  onClick={() => handleEditButtonClicked(event)}
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
                initial={{ scaleX: 0, opacity: 0 }} // Start hidden
                animate={{ scaleX: 1, opacity: 1 }} // Grow and fade in
                transition={{
                  duration: 0.5, // Adjust duration as needed
                  ease: "easeInOut",
                }}
                className="h-[1px] bg-gray-200 origin-center"
              />
            )}
          </AnimatePresence>
        ))}
      </ol>
    </section>
  );
};
