import { CalendarEvent } from "../../types/CalendarEvent";
import { InputField } from "./InputField";

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
  /* ----------------------------- Render function ---------------------------- */
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg"
    >
      {showNameInput ? (
        <InputField
          id="name"
          label="Enter your name..."
          value={editorName}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
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
              const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
              onEventChange("date", adjustedDate.toISOString().split('T')[0]);
            }}
          />
        </>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
        >
          {showNameInput
            ? "Continue"
            : isEditing
            ? "Update event"
            : "Add event"}
        </button>
      </div>
    </form>
  );
};
