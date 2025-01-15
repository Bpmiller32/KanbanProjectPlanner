import React, { useState } from "react";
import { Button } from "../sharedComponents/Button";

interface NameInputProps {
  editorName: string;
  setEditorName: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export const NameInput = ({
  editorName,
  setEditorName,
  onSubmit,
  onCancel,
}: NameInputProps) => {
  // State for local the input value, used to get proper cancel behavior
  const [tempName, setTempName] = useState(editorName);

  /* --------------------------------- Events --------------------------------- */
  const handleSubmitClicked = () => {
    setEditorName(tempName);
    onSubmit();
  };

  const handleCancelClicked = () => {
    setTempName(editorName);
    onCancel();
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div>
      <input
        type="text"
        value={tempName}
        onChange={(event) => setTempName(event.target.value)}
        placeholder="Enter your name...."
        className="w-full bg-neutral-700 text-sm text-neutral-100 p-1 rounded outline-none mb-2"
        autoFocus
      />
      <div className="flex gap-2">
        <Button onClick={handleCancelClicked} text="Cancel" bgColor="gray" />
        <Button onClick={handleSubmitClicked} text="Submit" bgColor="blue" />
      </div>
    </div>
  );
};
