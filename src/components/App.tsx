import { Board } from "./Board";
import { Calendar } from "./Calendar";

function App() {
  return (
    <>
      <h2 className="px-6 py-4 text-2xl/7 font-bold text-white sm:truncate sm:text-3xl sm:tracking-tight">
        Upcoming Events
      </h2>
      <Calendar />

      <h2 className="px-6 py-4 text-2xl/7 font-bold text-white sm:truncate sm:text-3xl sm:tracking-tight">
        Project Priority
      </h2>
      <Board />
    </>
  );
}

export default App;
