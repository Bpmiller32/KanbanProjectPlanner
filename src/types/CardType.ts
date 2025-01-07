import { ColumnType } from "./ColumnType";

export interface CardType {
  title: string;
  id: string;
  column: ColumnType;
  order: number;
  completed?: boolean;
}
