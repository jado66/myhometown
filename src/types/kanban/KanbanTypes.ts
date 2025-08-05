export type ColumnId = "backlog" | "testing" | "in-progress" | "done";

export interface Task {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: ColumnId;
  priority: number;
  is_hidden?: boolean; // Optional for backward compatibility
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: ColumnId[];
}
