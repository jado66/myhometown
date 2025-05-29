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

  // Ensure reported_tasks is initialized based on tasks
  useEffect(() => {
    if (!formData.reported_tasks && formData.tasks?.tasks) {
      // Initialize reported_tasks with the structure from tasks
      const initialReportedTasks = formData.tasks.tasks.map((task) => ({
        ...task,
        images: [], // Initialize empty images array for each task
      }));
      handleInputChange("reported_tasks", initialReportedTasks);
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
    [handleInputChange]
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
        helperText="The number of volunteers who actually participated in the project."
        min={0}
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
        helperText="This is NOT the total number of man hours. For example, if the project started at 8:00 AM and ended at noon, the duration would be 4 hours."
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
