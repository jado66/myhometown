export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: ColumnId;
  priority: number;
  created_at: string;
  is_hidden: boolean;
  type?: string; // Added type field
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: ColumnId[];
}

export type ColumnId = "backlog" | "in-progress" | "testing" | "done";
