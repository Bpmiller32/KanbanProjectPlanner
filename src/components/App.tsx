import { motion } from "framer-motion";
import { Board } from "./Board";
import { Schedule } from "./Schedule";

function App() {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center px-6 py-4 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none"
      >
        Upcoming Events
      </motion.h2>
      <Schedule />

      <h2 className="px-6 py-4 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none">
        Project Priority
      </h2>
      <Board />
    </>
  );
}

export default App;
