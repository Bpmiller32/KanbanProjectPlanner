import { ColumnType } from "./ColumnType";

export interface CardType {
  id: string;
  title: string;
  column: ColumnType;
  order: number;
  completed?: boolean;
  createdBy: string;
  createdAt: number;
  lastEditedBy: string;
  lastEditedTime: number;
  lastMovedTime: number;
  isArchived: boolean;
}
