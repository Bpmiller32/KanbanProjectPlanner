import React from "react";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const InputField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoFocus = false,
  onKeyDown,
}: InputFieldProps) => {
  /* ----------------------------- Render function ---------------------------- */
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        autoFocus={autoFocus}
        required
      />
    </div>
  );
};
