import { motion } from "framer-motion";
import { Board } from "./Board";
import { Schedule } from "./Schedule";
import AppLogo from "./sharedComponents/AppLogo";

function App() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AppLogo />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center px-6 py-10 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none"
      >
        Upcoming Events
      </motion.h2>
      <Schedule />

      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center px-6 py-10 font-bold text-gray-100 text-3xl tracking-tight cursor-default select-none"
      >
        Project Priority
      </motion.h2>
      <Board />
    </>
  );
}

export default App;
