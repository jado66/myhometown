"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Task,
  ColumnId,
  BoardData,
  Column,
} from "@/types/kanban/KanbanTypes";
import { supabase } from "@/util/supabase";

export function useKanbanData() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // fetchTasks now takes a parameter to include archived tasks
  const fetchTasks = useCallback(async (includeArchived = false) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("dev_tasks")
        .select("*")
        .order("priority", { ascending: true });

      if (fetchError) {
        console.error("Error fetching tasks:", fetchError);
        throw fetchError;
      }

      // Filter out hidden tasks by default, unless includeArchived is true
      const filteredTasks = (data || []).filter((task: Task) =>
        includeArchived ? true : !task.is_hidden
      );

      const tasks: { [key: string]: Task } = {};
      const columns: { [key: string]: Column } = {
        backlog: { id: "backlog", title: "Backlog", taskIds: [] },
        "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
        testing: { id: "testing", title: "Testing", taskIds: [] },
        done: { id: "done", title: "Done", taskIds: [] },
      };
      const columnOrder: ColumnId[] = [
        "backlog",
        "in-progress",
        "testing",
        "done",
      ];

      filteredTasks.forEach((task: Task) => {
        tasks[task.id] = task;
        if (columns[task.status]) {
          columns[task.status].taskIds.push(task.id);
        }
      });

      setBoardData({ tasks, columns, columnOrder });
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Archive a task by setting is_hidden to true
  const archiveTask = useCallback(
    async (taskId: string) => {
      const { error: archiveError } = await supabase
        .from("dev_tasks")
        .update({ is_hidden: true })
        .eq("id", taskId);
      if (archiveError) {
        console.error("Error archiving task:", archiveError);
        throw archiveError;
      }
      // After successful archive, refetch tasks
      await fetchTasks();
    },
    [fetchTasks]
  );

  const updateTaskStatusAndPriority = useCallback(
    async (
      taskId: string,
      newStatus: ColumnId,
      newPriority: number,
      affectedColumnTasks: Task[] // Tasks in the column where the item was dropped, in their new order
    ) => {
      // Update the moved task's status and priority
      const { error: taskUpdateError } = await supabase
        .from("dev_tasks")
        .update({ status: newStatus, priority: newPriority })
        .eq("id", taskId);

      if (taskUpdateError) {
        console.error(
          "Error updating task status and priority:",
          taskUpdateError
        );
        throw taskUpdateError;
      }

      // Update priorities for all tasks in the affected column
      // Include all required fields (e.g., title) to avoid NOT NULL constraint errors
      const updates = affectedColumnTasks.map((task, index) => ({
        id: task.id,
        priority: index, // New priority based on its position in the array
        title: task.title, // Ensure required fields are present
        description: task.description, // Add other required fields if needed
        status: task.status, // Keep status in sync
        type: task.type || "Story", // Include type field
      }));

      const { error: batchUpdateError } = await supabase
        .from("dev_tasks")
        .upsert(updates, { onConflict: "id" });

      if (batchUpdateError) {
        console.error("Error batch updating priorities:", batchUpdateError);
        throw batchUpdateError;
      }
    },
    []
  );

  const createTask = useCallback(
    async (
      title: string,
      description: string | null,
      type: string = "Story"
    ): Promise<Task> => {
      // Fetch current max priority for backlog to place new task at the end
      const { data: maxPriorityData, error: maxPriorityError } = await supabase
        .from("dev_tasks")
        .select("priority")
        .eq("status", "backlog")
        .order("priority", { ascending: false })
        .limit(1);

      if (maxPriorityError) {
        console.error("Error fetching max priority:", maxPriorityError);
        throw maxPriorityError;
      }

      const newPriority =
        maxPriorityData && maxPriorityData.length > 0
          ? maxPriorityData[0].priority + 1
          : 0;

      const { data, error: insertError } = await supabase
        .from("dev_tasks")
        .insert({
          title,
          description,
          status: "backlog",
          priority: newPriority,
          type,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating task:", insertError);
        throw insertError;
      }

      // After successful creation, refetch tasks to update the board data
      await fetchTasks();
      return data;
    },
    [fetchTasks]
  );

  useEffect(() => {
    fetchTasks(showArchived);
  }, [fetchTasks, showArchived]);

  // Delete a task by id
  const deleteTask = useCallback(
    async (taskId: string) => {
      const { error: deleteError } = await supabase
        .from("dev_tasks")
        .delete()
        .eq("id", taskId);
      if (deleteError) {
        console.error("Error deleting task:", deleteError);
        throw deleteError;
      }
      // After successful deletion, refetch tasks
      await fetchTasks();
    },
    [fetchTasks]
  );

  return {
    boardData,
    loading,
    error,
    updateTaskStatusAndPriority,
    createTask,
    deleteTask,
    archiveTask,
    refetchTasks: fetchTasks,
    showArchived,
    setShowArchived,
  };
}
