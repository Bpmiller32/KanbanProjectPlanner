import { Day } from "../types/Day";
import { Month } from "../types/Month";

export class Utils {
  // Method to generate calendar data for the given date
  public static generateCalendarData(date: Date): Month[] {
    const months: Month[] = [];
    const today = new Date();

    for (let i = 0; i < 2; i++) {
      const currentMonth = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const monthName = currentMonth.toLocaleString("default", {
        month: "long",
      });
      const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).getDate();
      const firstDayOfWeek = currentMonth.getDay();

      const days: Day[] = [];

      // Add trailing days from the previous month
      for (let j = 0; j < firstDayOfWeek; j++) {
        const prevDate = new Date(currentMonth);
        prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - j));
        days.unshift({
          date: prevDate.toISOString().split("T")[0],
          isCurrentMonth: false,
          isToday: false,
        });
      }

      // Add current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday =
          today.toDateString() ===
          new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
          ).toDateString();

        days.push({
          date: `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          isCurrentMonth: true,
          isToday,
        });
      }

      // Add leading days from the next month
      while (days.length % 7 !== 0) {
        const nextDate = new Date(days[days.length - 1].date);
        nextDate.setDate(nextDate.getDate() + 1);
        days.push({
          date: nextDate.toISOString().split("T")[0],
          isCurrentMonth: false,
          isToday: false,
        });
      }

      // Ensure the total number of days is exactly 42
      while (days.length < 42) {
        const nextDate = new Date(days[days.length - 1].date);
        nextDate.setDate(nextDate.getDate() + 1);
        days.push({
          date: nextDate.toISOString().split("T")[0],
          isCurrentMonth: false,
          isToday: false,
        });
      }

      months.push({
        name: monthName,
        year: currentMonth.getFullYear(),
        days,
      });
    }

    return months;
  }

  // Method to dynamically combine class names
  public static combineClassNames(
    ...classes: (string | boolean | undefined)[]
  ): string {
    return classes.filter(Boolean).join(" ");
  }

  // Method to get today's date in YYYY-MM-DD format
  public static getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  // Method to format a date string into a readable format
  public static formatEventDate(dateStr: string): string {
    // Split the input date string (YYYY-MM-DD) into components
    const [year, month, day] = dateStr.split("-").map(Number);

    // Create a new Date object using the components. `month - 1` because JavaScript months are zero-indexed (0 = January, 11 = December)
    const date = new Date(year, month - 1, day);

    // Format the date as a readable string
    return date.toLocaleDateString("en-US", {
      weekday: "short", // Short name for the weekday (e.g., "Mon")
      month: "short", // Short name for the month (e.g., "Jan")
      day: "numeric", // Numeric day (e.g., "1", "15")
    });
  }
}
