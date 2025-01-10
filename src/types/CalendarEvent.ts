export interface CalendarEvent {
  id: string;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  createdAt?: number;
  createdBy?: string;
  lastEditedBy?: string;
  lastUpdated?: number;
  isArchived?: boolean;
}
