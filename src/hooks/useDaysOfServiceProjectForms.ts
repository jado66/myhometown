import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { debounce } from "@mui/material";
import { ProjectFormData } from "@/types/dos/ProjectFormData";

interface UseProjectFormProps {
  projectId?: string;
  communityId: string;
}

export const useDaysOfServiceProjectForm = ({
  projectId,
  communityId,
}: UseProjectFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>(
    {} as ProjectFormData
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  const debouncedSave = useCallback(
    debounce(async (data: ProjectFormData) => {
      setIsSaving(true);
      try {
        const projectData = {
          ...data,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        };

        if (!projectId) {
          // Create new project
          projectData.created_by = user?.id;
          projectData.created_at = new Date().toISOString();

          const { data: newProject, error } = await supabase
            .from("days_of_service_project_forms")
            .insert(projectData)
            .select("id")
            .single();

          if (error) throw error;

          // Update projectId with the new ID
          if (newProject) {
            // You might need to handle the new ID here
            console.log("Created new project with ID:", newProject.id);
          }
        } else {
          // Update existing project
          const { error } = await supabase
            .from("days_of_service_project_forms")
            .update(projectData)
            .eq("id", projectId);

          if (error) throw error;
        }

        // Only show success toast for manual saves, not debounced ones
        // toast.success("Project saved successfully");
      } catch (error) {
        toast.error("Failed to save project");
        console.error("Failed to save project", error);
      } finally {
        setIsSaving(false);
      }
    }, 1500), // Wait 1.5 seconds after the last change before saving
    [projectId, communityId, user?.id]
  );

  useEffect(() => {
    if (projectId) {
      loadProject();
    } else {
      // Initialize with default values for a new project
      setFormData({
        community_id: communityId,
        budget_hidden: false,
        has_prep_day: false,
        are_blue_stakes_needed: false,
        is_dumpster_needed: false,
        is_second_dumpster_needed: false,
        materials_procured: false,
        tools_arranged: false,
        materials_on_site: false,
        called_811: false,
        dumpster_requested: false,
        partner_stake_contacted: false,
        partner_ward_contacted: false,
        site_visit_done_with_resource_couple: false,
        site_visit_done_with_host: false,
        site_visit_done_with_partner: false,
        review_completed_with_couple: false,
        review_completed_with_homeowner: false,
        tasks: { tasks: [] },
        collaborators: [],
      });
      setIsLoading(false);
    }
  }, [projectId, communityId]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      toast.error("Failed to load project");
      console.error("Failed to load project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberInputChange = (
    field: keyof ProjectFormData,
    value: any
  ) => {
    let cleanedValue: number | null = null;

    // Handle different input scenarios
    if (value === "" || value === undefined) {
      // Empty string or undefined becomes null
      cleanedValue = null;
    } else if (typeof value === "string") {
      // Try to convert string to number
      const parsed = parseFloat(value);
      // If it's a valid number, use it; otherwise, use null
      cleanedValue = !isNaN(parsed) ? parsed : null;
    } else if (typeof value === "number") {
      // Already a number, use it directly
      cleanedValue = isNaN(value) ? null : value;
    }

    // Call the regular handleInputChange with the cleaned value
    handleInputChange(field, cleanedValue);
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };

    setFormData(newFormData);
    debouncedSave(newFormData);
  };

  const handleMultipleInputChange = (inputs: Partial<ProjectFormData>) => {
    const newFormData = {
      ...formData,
      ...inputs,
    };

    setFormData(newFormData);
    debouncedSave(newFormData);
  };

  const addCollaborator = (collaborator: {
    email: string;
    from: string;
    message: string;
    date: Date;
  }) => {
    const newCollaborators = [...(formData.collaborators || []), collaborator];

    const newFormData = {
      ...formData,
      collaborators: newCollaborators,
    };

    setFormData(newFormData);
    debouncedSave(newFormData);
  };

  const finishProject = async () => {
    saveProject(true);
  };

  const saveProject = async (isFinished: boolean = false) => {
    setIsSaving(true);
    try {
      const projectData = {
        ...formData,
        community_id: communityId,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (isFinished) {
        projectData.status = "completed";
      }

      let response;

      if (!projectId) {
        // Create new project
        projectData.created_by = user?.id;
        projectData.created_at = new Date().toISOString();

        response = await supabase
          .from("days_of_service_project_forms")
          .insert(projectData)
          .select("id");
      } else {
        // Update existing project
        response = await supabase
          .from("days_of_service_project_forms")
          .update(projectData)
          .eq("id", projectId);
      }

      if (response.error) throw response.error;

      toast.success("Project saved successfully");
    } catch (error) {
      console.error("Failed to save project", error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeStep,
    setActiveStep,
    formData,
    setFormData,
    handleInputChange,
    handleMultipleInputChange,
    handleNumberInputChange,
    addCollaborator,
    saveProject,
    finishProject,
    isLoading,
    isSaving,
  };
};
