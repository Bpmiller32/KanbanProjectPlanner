import { CalendarEvent } from "../../types/CalendarEvent";
import { Button } from "../sharedComponents/Button";
import { InputField } from "./InputField";
import { motion } from "framer-motion";

interface EventFormProps {
  isEditing: boolean;
  showNameInput: boolean;
  editorName: string;
  editingEvent: Partial<CalendarEvent>;
  onNameChange: (name: string) => void;
  onEventChange: (field: keyof CalendarEvent, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const EventForm = ({
  isEditing,
  showNameInput,
  editorName,
  editingEvent,
  onNameChange,
  onEventChange,
  onCancel,
  onSubmit,
}: EventFormProps) => {
  const handleSubmission = () => {
    console.log("Handling submission", { showNameInput, editorName });
    if (showNameInput && !editorName.trim()) {
      console.log("No name provided, returning");
      return;
    }
    console.log("Calling onSubmit");
    onSubmit(new Event("submit") as unknown as React.FormEvent);
    console.log("onSubmit called");
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg overflow-hidden"
    >
      {showNameInput ? (
        <InputField
          id="name"
          label="Enter your name..."
          value={editorName}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && editorName.trim()) {
              e.preventDefault();
              handleSubmission();
            }
          }}
        />
      ) : (
        <>
          <InputField
            id="title"
            label="Event title"
            value={editingEvent.title || ""}
            onChange={(e) => onEventChange("title", e.target.value)}
          />
          <InputField
            id="date"
            label="Date"
            type="date"
            value={editingEvent.date || ""}
            onChange={(e) => {
              const date = new Date(e.target.value);
              const offset = date.getTimezoneOffset();
              const adjustedDate = new Date(
                date.getTime() - offset * 60 * 1000
              );
              onEventChange("date", adjustedDate.toISOString().split("T")[0]);
            }}
          />
        </>
      )}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} text="Cancel" bgColor="gray" />
        <Button
          onClick={handleSubmission}
          text={
            showNameInput
              ? "Continue"
              : isEditing
              ? "Update event"
              : "Add event"
          }
          bgColor={showNameInput ? "blue" : isEditing ? "blue" : "indigo"}
        />
      </div>
    </motion.div>
  );
};
