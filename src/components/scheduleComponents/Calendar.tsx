import { useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Day } from "../../types/Day";
import { Month } from "../../types/Month";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Utils } from "../Utils";
import { AnimatePresence, motion } from "framer-motion";

interface CalendarProps {
  eventCounts: { [date: string]: number };
}

export const Calendar = ({ eventCounts }: CalendarProps) => {
  // State to store the the currently displayed month, generate calendar data for the current and next month.
  const [currentDate, setCurrentDate] = useState(new Date());
  const months = Utils.generateCalendarData(currentDate);

  // Move to the previous month
  const handlePrevMonthClicked = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  /* --------------------------------- Events --------------------------------- */
  // Move to the next month
  const handleNextMonthClicked = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Handle a date click, either adding or removing unnamed events
  const handleDateClicked = async (date: string) => {
    try {
      const eventsRef = collection(db, "events");
      const currentCount = eventCounts[date] || 0;

      // Dot logic
      if (currentCount >= 3) {
        // Remove all unnamed events for this date
        const snapshot = await getDocs(
          query(
            eventsRef,
            where("date", "==", date),
            where("title", "==", "unnamed event")
          )
        );
        await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
      } else {
        // Add a new unnamed event
        const newEvent = {
          date,
          title: "unnamed event",
          createdAt: Date.now(),
          createdBy: "Anonymous",
          lastEditedBy: "Anonymous",
          lastUpdated: Date.now(),
          isArchived: false,
        };
        await setDoc(doc(eventsRef), newEvent);
      }
    } catch (error) {
      console.error("Error updating events:", error);
    }
  };

  /* --------------------------------- Helpers -------------------------------- */
  // Helper to determine CSS class based on event count
  const getEventCountClass = (count: number): string => {
    if (count === 1) return "bg-yellow-100 text-gray-900";
    if (count === 2) return "bg-orange-100 text-gray-900";
    if (count >= 3) return "bg-red-100 text-gray-900";
    return "bg-white text-gray-900";
  };

  // Helper to render the dot indicators on a given date
  const renderEventIndicators = (date: string) => {
    const count = Math.min(eventCounts[date] || 0, 3);

    return (
      <AnimatePresence>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="h-1 w-1 rounded-full bg-indigo-600"
          />
        ))}
      </AnimatePresence>
    );
  };

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div className="relative grid grid-cols-1 gap-x-14 tablet:grid-cols-2">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrevMonthClicked}
        className="absolute -left-1.5 -top-1 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 duration-[250ms]"
      >
        <FaChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNextMonthClicked}
        className="absolute -right-1.5 -top-1 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500 duration-[250ms]"
      >
        <FaChevronRight className="w-5 h-5" />
      </button>

      {/* Render Calendar Months */}
      {months.map((month: Month, monthIndex: number) => (
        <section
          key={monthIndex}
          className={`text-center ${
            monthIndex === months.length - 1 ? "hidden tablet:block" : ""
          }`}
        >
          {/* Month Title */}
          <motion.h2
            key={`${month.name}-${month.year}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-gray-100 cursor-default select-none"
          >
            {`${month.name} ${month.year}`}
          </motion.h2>

          {/* Weekday Headers */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 grid grid-cols-7 text-xs text-gray-400 cursor-default select-none"
          >
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </motion.div>

          {/* Days Grid */}
          <motion.div
            key={`days-grid-${month.name}-${month.year}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-2 grid grid-cols-7 gap-px bg-gray-200 text-sm rounded-lg"
          >
            {month.days.map((day: Day, dayIndex: number) => (
              <button
                key={day.date}
                onClick={() => handleDateClicked(day.date)}
                className={`${
                  day.isCurrentMonth
                    ? getEventCountClass(eventCounts[day.date] || 0)
                    : "bg-gray-50 text-gray-400"
                } ${day.isToday ? "font-semibold text-indigo-600" : ""} ${
                  dayIndex === 0 ? "rounded-tl-lg" : ""
                } ${dayIndex === 6 ? "rounded-tr-lg" : ""} ${
                  dayIndex === 35 ? "rounded-bl-lg" : ""
                } ${
                  dayIndex === 41 ? "rounded-br-lg" : ""
                } relative py-1.5 hover:bg-gray-100 duration-[250ms]`}
              >
                {/* Day Square */}
                <div className="h-14 flex flex-col items-center justify-between py-1">
                  {/* Day Number */}
                  <motion.time
                    dateTime={day.date}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                      day.isToday
                        ? "bg-indigo-600 font-semibold text-white"
                        : ""
                    }`}
                  >
                    {parseInt(day.date.split("-").pop() || "0", 10)}
                  </motion.time>

                  {/* Event Indicators */}
                  <div className="h-2 flex gap-0.5">
                    {renderEventIndicators(day.date)}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        </section>
      ))}
    </div>
  );
};
