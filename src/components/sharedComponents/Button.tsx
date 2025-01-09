interface ButtonProps {
  text?: string;
  bgColor?: "indigo" | "red" | "blue" | "gray";
  onClick?: () => void;
}

// Tailwind doesn't support dynamically setting the bgColor using template literals for treeshaking reasons, this is the alternative
const bgColorClasses = {
  indigo: "bg-indigo-600 hover:bg-indigo-500",
  red: "bg-red-600 hover:bg-red-500",
  blue: "bg-blue-600 hover:bg-blue-500",
  gray: "bg-gray-600 hover:bg-gray-500",
};

export const Button = ({
  text = "Click",
  bgColor = "indigo",
  onClick,
}: ButtonProps) => {
  /* ----------------------------- Render function ---------------------------- */
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium text-gray-100 rounded-md ${bgColorClasses[bgColor]} duration-[250ms]`}
    >
      {text}
    </button>
  );
};
