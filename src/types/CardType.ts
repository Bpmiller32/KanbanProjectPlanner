export interface CardType {
  id: string;
  title: string;
  column: string;
  order: number;
  completed?: boolean;
  createdBy: string;
  createdAt: number;
  lastEditedBy: string;
  lastEditedTime: number;
  lastMovedTime: number;
  isArchived: boolean;
}
