import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface Day {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
}

interface Month {
  name: string;
  days: Day[];
}

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  createdAt?: number;
  createdBy?: string;
  lastEditedBy?: string;
  lastUpdated?: number;
}

function generateCalendarData(date: Date): Month[] {
  // ... [Previous generateCalendarData implementation remains the same]
  const months: Month[] = [];
  const currentDate = new Date();

  // Generate current month and next month
  for (let i = 0; i < 2; i++) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
    const monthName = monthDate.toLocaleString("default", { month: "long" });
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).getDate();

    // Get the first day of the month
    const firstDay = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    ).getDay();
    // Use Sunday-based week (0 = Sunday)
    const firstDayIndex = firstDay;

    // Initialize days array with explicit type and minimum size
    const days = [] as Array<Day>;

    // Add days from previous month if needed
    if (firstDayIndex > 0) {
      const prevMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        0
      );
      const prevMonthDays = prevMonth.getDate();
      for (let j = 0; j < firstDayIndex; j++) {
        const day = prevMonthDays - firstDayIndex + j + 1;
        days.push({
          date: `${prevMonth.getFullYear()}-${String(
            prevMonth.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          isCurrentMonth: false,
        });
      }
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        isToday:
          currentDate.getDate() === day &&
          currentDate.getMonth() === monthDate.getMonth() &&
          currentDate.getFullYear() === monthDate.getFullYear(),
      });
    }

    // Add days from next month to complete the grid (ensure at least 42 days total)
    const remainingDays = Math.max(42 - days.length, 0); // 6 rows * 7 days = 42
    const nextMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      1
    );
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: `${nextMonth.getFullYear()}-${String(
          nextMonth.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        isCurrentMonth: false,
      });
    }

    // Ensure days array is properly populated before adding to months
    if (days.length === 42) {
      months.push({
        name: monthName,
        days,
      });
    } else {
      throw new Error(
        `Invalid calendar data: expected 42 days but got ${days.length}`
      );
    }
  }

  return months;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [editorName, setEditorName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingEvent, setEditingEvent] = useState<
    Partial<CalendarEvent> & { id?: string }
  >({
    date: new Date().toISOString().split("T")[0],
    title: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const months = generateCalendarData(currentDate);

  useEffect(() => {
    const eventsRef = collection(db, "events");

    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];

      // Sort events by date and time
      eventsData.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });

      setEvents(eventsData);

      // Calculate event counts per date
      const counts: Record<string, number> = {};
      eventsData.forEach((event) => {
        counts[event.date] = (counts[event.date] || 0) + 1;
      });
      setEventCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = async (date: string) => {
    try {
      const eventsRef = collection(db, "events");
      const currentCount = eventCounts[date] || 0;

      if (currentCount >= 3) {
        // Remove all unnamed events for this date
        const snapshot = await getDocs(
          query(
            eventsRef,
            where("date", "==", date),
            where("title", "==", "unnamed event")
          )
        );
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
        }
      } else {
        // Add a new unnamed event
        await setDoc(doc(eventsRef), {
          date,
          title: "unnamed event",
          createdAt: Date.now(),
          createdBy: "Anonymous",
          lastEditedBy: "Anonymous",
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error updating events:", error);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent.title || !editingEvent.date) return;

    if (!editorName.trim()) {
      setShowNameInput(true);
      return;
    }

    try {
      const eventsRef = collection(db, "events");
      const eventData = {
        ...editingEvent,
        lastUpdated: Date.now(),
        lastEditedBy: editorName.trim(),
      };

      if (isEditing && editingEvent.id) {
        // Update existing event
        await setDoc(doc(eventsRef, editingEvent.id), eventData);
      } else {
        // Add new event
        await setDoc(doc(eventsRef), {
          ...eventData,
          createdAt: Date.now(),
          createdBy: editorName.trim(),
        });
      }

      setShowEventForm(false);
      setIsEditing(false);
      setEditingEvent({
        date: new Date().toISOString().split("T")[0],
        title: "",
      });
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEditing(true);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const eventsRef = collection(db, "events");
      await deleteDoc(doc(eventsRef, eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const formatEventDate = (dateStr: string) => {
    // Create date in local timezone
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="pl-16 min-w-[765px] max-w-[765px]">
      <div className="relative grid grid-cols-1 gap-x-14 md:grid-cols-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="absolute -left-1.5 -top-1 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNextMonth}
          className="absolute -right-1.5 -top-1 flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </button>
        {months.map((month: Month, monthIdx: number) => (
          <section
            key={monthIdx}
            className={classNames(
              monthIdx === months.length - 1 && "hidden md:block",
              "text-center"
            )}
          >
            <h2 className="text-sm font-semibold text-gray-900">
              {`${month.name} ${new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + monthIdx
              ).getFullYear()}`}
            </h2>
            <div className="mt-6 grid grid-cols-7 text-xs/6 text-gray-500">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
              {month.days.map((day: Day, dayIdx: number) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  className={classNames(
                    day.isCurrentMonth
                      ? (() => {
                          const count = eventCounts[day.date] || 0;
                          if (count === 1) return "bg-yellow-100 text-gray-900";
                          if (count === 2) return "bg-orange-100 text-gray-900";
                          if (count >= 3) return "bg-red-100 text-gray-900";
                          return "bg-white text-gray-900";
                        })()
                      : "bg-gray-50 text-gray-400",
                    dayIdx === 0 && "rounded-tl-lg",
                    dayIdx === 6 && "rounded-tr-lg",
                    dayIdx === 35 && "rounded-bl-lg",
                    dayIdx === 41 && "rounded-br-lg",
                    "relative py-1.5 hover:bg-gray-100 focus:z-10"
                  )}
                >
                  <div className="h-14 flex flex-col items-center justify-between py-1">
                    <div className="flex-1 flex items-center">
                      <time
                        dateTime={day.date}
                        className={classNames(
                          day.isToday &&
                            "bg-indigo-600 font-semibold text-white",
                          "mx-auto flex size-7 items-center justify-center rounded-full"
                        )}
                      >
                        {(day.date.split("-").pop() as string).replace(
                          /^0/,
                          ""
                        )}
                      </time>
                    </div>
                    <div className="h-2 flex items-center">
                      <div className="flex gap-0.5">
                        {[
                          ...Array(Math.min(eventCounts[day.date] || 0, 3)),
                        ].map((_, i) => (
                          <div
                            key={i}
                            className="size-1 rounded-full bg-indigo-600"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Upcoming events
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingEvent({
                date: new Date().toISOString().split("T")[0],
                title: "",
              });
              setShowEventForm(!showEventForm);
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
          >
            Add event
          </button>
        </div>
        {showEventForm && (
          <form
            onSubmit={handleEventSubmit}
            className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg"
          >
            {showNameInput ? (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter your name...
                </label>
                <input
                  type="text"
                  id="name"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                  autoFocus
                />
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Event title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEventForm(false);
                  setIsEditing(false);
                  setShowNameInput(false);
                  setEditingEvent({
                    date: new Date().toISOString().split("T")[0],
                    title: "",
                  });
                }}
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
        )}
        <ol className="mt-2 divide-y divide-gray-200 text-sm/6 text-gray-500">
          {events.map((event) => {
            const formattedDate = formatEventDate(event.date);

            return (
              <li key={event.id} className="py-4 sm:flex items-center">
                <time dateTime={event.date} className="w-28 flex-none">
                  {formattedDate}
                </time>
                <div className="mt-2 flex-auto sm:mt-0">
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  {event.title !== "unnamed event" && (
                    <p className="text-xs text-gray-500">
                      Created by {event.createdBy}
                      {event.lastEditedBy !== event.createdBy &&
                        ` • Last edited by ${event.lastEditedBy}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
