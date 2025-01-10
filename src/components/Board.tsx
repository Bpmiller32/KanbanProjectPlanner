import { Dispatch, SetStateAction } from "react";
import { CardType } from "../types/CardType";
import { Column } from "./boardComponents/Column";
import { ColumnType } from "../types/ColumnType";
import { motion } from "framer-motion";

interface BoardProps {
  cards: CardType[];
  setCards: (updater: SetStateAction<CardType[]>) => Promise<void>;
  editorName: string;
  setEditorName: Dispatch<SetStateAction<string>>;
}

export const Board = ({ cards, setCards, editorName, setEditorName }: BoardProps) => {
  const boardColumns: ColumnType[] = [
    { title: "Backlog", column: "backlog", color: "text-neutral-500" },
    { title: "Low", column: "todo", color: "text-blue-200" },
    { title: "Medium", column: "doing", color: "text-yellow-200" },
    { title: "High", column: "done", color: "text-red-300" },
  ];

  /* ----------------------------- Render function ---------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-x-auto pb-32 select-none"
    >
      <div className="flex justify-start sm:justify-center gap-3 px-6 min-w-max">
        {boardColumns.map(({ title, column, color }) => (
          <Column
            key={column}
            title={title}
            column={column}
            headingColor={color}
            cards={cards}
            setCards={setCards}
            editorName={editorName}
            setEditorName={setEditorName}
          />
        ))}
      </div>
    </motion.div>
  );
};
