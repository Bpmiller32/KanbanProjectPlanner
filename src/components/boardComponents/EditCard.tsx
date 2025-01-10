import React, { useState } from "react";
import { Button } from "../sharedComponents/Button";
import { NameInput } from "./NameInput";

interface EditCardProps {
  title: string;
  editorName: string;
  setEditorName: React.Dispatch<React.SetStateAction<string>>;
  onUpdate: (newTitle: string) => void;
  onCancel: () => void;
}

export const EditCard = ({
  title,
  editorName,
  setEditorName,
  onUpdate,
  onCancel,
}: EditCardProps) => {
  // State to manage the new title being edited, control whether the NameInput component is visible
  const [editedTitle, setEditedTitle] = useState(title);
  const [showNameInput, setShowNameInput] = useState(false);

  /* --------------------------------- Events --------------------------------- */
  const handleSubmitClicked = () => {
    // If the editor's name is empty show the name input field
    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    // Otherwise update the card title
    onUpdate(editedTitle.trim());
  };

  const handleNameInputComplete = () => {
    // Do nothing if the editor's name is still empty
    if (!editorName.trim()) {
      return;
    }

    // Hide the name input field and update the card title
    setShowNameInput(false);
    onUpdate(editedTitle.trim());
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div>
      {showNameInput ? (
        <NameInput
          editorName={editorName}
          setEditorName={setEditorName}
          onSubmit={handleNameInputComplete}
          onCancel={() => setShowNameInput(false)}
        />
      ) : (
        <>
          <textarea
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-neutral-700 text-sm text-neutral-100 p-1 rounded outline-none resize-none min-h-[1.5rem] mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={onCancel} text="Cancel" bgColor="gray" />
            <Button
              onClick={handleSubmitClicked}
              text="Update card"
              bgColor="blue"
            />
          </div>
        </>
      )}
    </div>
  );
};
