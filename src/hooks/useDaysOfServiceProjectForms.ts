import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { debounce } from "@mui/material";

export interface ProjectFormData {
  // Basic Information
  projectDeveloper: string;
  projectDeveloperPhone1: string;
  projectDeveloperEmail1: string;
  projectDeveloperPhone2: string;
  projectDeveloperEmail2: string;
  projectId: string;

  // Property Information
  propertyOwner: string;
  phoneNumber: string;
  email: string;

  // Address
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;

  // Project Details
  workSummary: string;
  dateOfService: string;
  volunteersNeeded: number;

  // Resource Couple Information
  projectDevelopmentCouple: string;
  projectDevelopmentCouplePhone1: string;
  projectDevelopmentCoupleEmail1: string;
  projectDevelopmentCouplePhone2: string;
  projectDevelopmentCoupleEmail2: string;

  // Planning
  preferredRemedies: string;
  tasks: {
    tasks: Array<{
      description: string;
      todos: string[];
    }>;
  };

  // Resources & Budget
  budget: string;
  budgetEstimates: number;
  homeownerAbility: string;
  homeownerAbilityEstimates: number;
  volunteerTools: string[];
  equipment: string[];
  materials: string[];

  // Status Flags
  materialsProcured: boolean;
  toolsArranged: boolean;
  materialsOnSite: boolean;
  called811: boolean;
  dumpsterRequested: boolean;

  // Partner Information
  partnerStake: string;
  partnerStakeLiaison: string;
  partnerStakeLiaisonPhone: string;
  partnerStakeLiaisonEmail: string;
  partnerWard: string;
  partnerWardLiaison: string;
  partnerWardLiaisonPhone1: string;
  partnerWardLiaisonEmail1: string;
  partnerWardLiaisonPhone2: string;
  partnerWardLiaisonEmail2: string;

  // Status Flags
  partnerStakeContacted: boolean;
  partnerWardContacted: boolean;
  siteVisitDoneWithResourceCouple: boolean;
  siteVisitDoneWithHost: boolean;
  siteVisitDoneWithPartner: boolean;
  reviewCompletedWithCouple: boolean;
  reviewCompletedWithHomeowner: boolean;

  // Review
  reviewNotes: string;

  // Collaboration
  collaborators: Array<{
    email: string;
    from: string;
    message: string;
    date: Date;
  }>;
}

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
        };

        if (!projectId) {
          projectData.created_by = user?.id;
        }

        const { error } = await supabase
          .from("days_of_service_project_forms")
          .update(projectData)
          .eq("id", projectId);

        if (error) throw error;

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
    if (communityId) {
    }

    if (projectId) {
      loadProject();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerChange = (parnterType: string, value: string) => {};

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

  const handleMultipleInputChange = (inputs) => {
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
    setFormData((prev) => ({
      ...prev,
      collaborators: [...(prev.collaborators || []), collaborator],
    }));
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
      };

      if (isFinished) {
        projectData.status = "completed";
      }

      if (!projectId) {
        projectData.created_by = user?.id;
      }

      const { error } = await supabase
        .from("days_of_service_project_forms")
        .update(projectData)
        .eq("id", projectId);

      if (error) throw error;

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
