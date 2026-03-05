import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import { EditorState } from "lexical";
import ProjectTextField from "./ProjectTextField";
import TaskReportingTable from "@/components/days-of-service/form-components/TaskReportingTable";
import PlaygroundApp from "@/components/lexical-editor/LexicalEditor"; // Your modified PlaygroundApp
import JsonViewer from "@/components/util/debug/DebugOutput";

const ReportingStep = () => {
  const { formData, handleInputChange, handleNumberInputChange } =
    useProjectForm();
  const [editing, setEditing] = useState(true);
  const debounceTimerRef = useRef(null);

  // Ensure reported_tasks is initialized based on tasks,
  // and backfill before images from Step 2 photos if missing
  useEffect(() => {
    if (!formData.tasks?.tasks) return;

    if (!formData.reported_tasks) {
      // First-time initialization: pull in Step 2 photos as "before" images
      const initialReportedTasks = formData.tasks.tasks.map((task) => ({
        ...task,
        images:
          task.photos?.length > 0
            ? task.photos.map((photoUrl) => ({ type: "before", url: photoUrl }))
            : [],
      }));
      handleInputChange("reported_tasks", initialReportedTasks);
    } else {
      // Backfill: if reported_tasks exist but are missing before images
      // that are available in the planning tasks, add them
      let changed = false;
      const updated = formData.reported_tasks.map((reportedTask) => {
        const planningTask = formData.tasks.tasks.find(
          (t) => t.id === reportedTask.id,
        );
        if (!planningTask?.photos?.length) return reportedTask;

        const images = reportedTask.images || [];
        const hasBeforeImage = images.some((img) => img.type === "before");
        if (hasBeforeImage) return reportedTask;

        changed = true;
        return {
          ...reportedTask,
          images: [
            ...planningTask.photos.map((url) => ({ type: "before", url })),
            ...images,
          ],
        };
      });
      if (changed) {
        handleInputChange("reported_tasks", updated);
      }
    }
  }, [formData.tasks]);

  // Handle changes from the Lexical editor with debouncing
  const handleLexicalChange = useCallback(
    (editorState) => {
      // Clear the previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer to update after 500ms of inactivity
      debounceTimerRef.current = setTimeout(() => {
        // Convert the editor state to JSON string for storage
        const jsonString = JSON.stringify(editorState.toJSON());
        handleInputChange("report_content", jsonString);
      }, 500);
    },
    [handleInputChange],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6">Project Reporting</Typography>
      <ProjectTextField
        label="Number of Volunteers"
        type="number"
        key="actual_volunteers"
        helperText="Please provide the number of volunteers who started on your project. To avoid duplicate count, do not include anyone who transferred from another project."
        min={0}
        sx={{ mb: 1 }}
        value={formData.actual_volunteers}
        onChange={(e) =>
          handleNumberInputChange("actual_volunteers", e.target.value)
        }
      />
      <ProjectTextField
        label="Actual duration of project (hours)"
        type="number"
        key="actual_project_duration"
        min={0}
        max={12}
        value={formData.actual_project_duration}
        onChange={(e) =>
          handleInputChange("actual_project_duration", e.target.value)
        }
        helperText="Specify the total duration of the project in hours. For example, if the project started at 8:00 AM and ended at 12:00 PM, enter 4 hours. Do not calculate total man-hours."
      />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Project Report Pictures
      </Typography>
      {formData.tasks?.tasks && (
        <TaskReportingTable
          tasks={formData.tasks.tasks}
          value={formData.reported_tasks || []}
          onChange={(newTasks) => handleInputChange("reported_tasks", newTasks)}
          isLocked={false}
        />
      )}

      <JsonViewer data={formData} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Project Report (Optional)
      </Typography>

      <Box sx={{ mb: 3 }}>
        <PlaygroundApp
          initialContent={formData.report_content}
          onChange={handleLexicalChange}
        />
      </Box>
    </Box>
  );
};

export default ReportingStep;
