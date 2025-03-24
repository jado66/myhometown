import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { useDaysOfServiceProjectForm } from "@/hooks/useDaysOfServiceProjectForms";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { Box } from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { isAuthenticatedBudget } from "@/util/auth/simpleAuth";
const API_BASE_URL = "/api/database/project-forms";
const ProjectFormContext = createContext();

export function ProjectFormProvider({
  children,
  formId,
  date,
  communityId,
  dayOfService,
  isBudgetAdmin,
}) {
  const {
    activeStep,
    setActiveStep,
    formData,
    setFormData,
    handleInputChange,
    addCollaborator,
    saveProject,
    finishProject,
    handleMultipleInputChange,
    handleNumberInputChange,
    isLoading,
    isSaving: isSavingProject,
  } = useDaysOfServiceProjectForm({
    projectId: formId,
    communityId,
  });

  const { addPartnerToDayOfService } = useDaysOfService();

  const handleSelectChange = async (field, newValue) => {
    const value = newValue ? newValue.value : "";
    handleInputChange(field, value);

    // If a new value is created, add it to the days_of_service
    if (newValue && newValue.__isNew__) {
      const type = field === "partner_stake" ? "stake" : "ward";
      await addPartnerToDayOfService(dayOfService.id, type, value);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [community, setCommunity] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isBudgetAuthenticated, setIsBudgetAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticatedBudget();
    setIsBudgetAuthenticated(authenticated);
  }, []);

  const [addressValidation, setAddressValidation] = useState({
    isValid: false,
    isChecking: false,
    errors: {},
  });

  const stakeOptions = (dayOfService?.partner_stakes || []).map((stake) => ({
    value: stake,
    label: stake,
  }));

  const wardOptions = (dayOfService?.partner_wards || []).map((ward) => ({
    value: ward,
    label: ward,
  }));

  const { fetchNewCommunities } = useCommunities();

  useEffect(() => {
    if (communityId) {
      loadCommunity();
    }
  }, [communityId]);

  const loadCommunity = async () => {
    const { data, error } = await fetchNewCommunities({
      query: (q) => q.eq("id", communityId),
    });

    if (error) throw error;

    if (data) {
      setCommunity(data[0]);
    }
  };

  const getProjectForm = useCallback(async (formId) => {
    console.log("Get project is deprecated");
  }, []);

  const updateProjectForm = useCallback(async (formId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update project form");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const debouncedSave = useCallback(
    debounce(async (data) => {
      if (data.id) {
        setIsSaving(true);
        try {
          await updateProjectForm(data.id, data);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000),
    [updateProjectForm]
  );

  const handleAddressValidated = useCallback(
    (validatedAddress) => {
      // Check if all required address fields are present
      if (
        validatedAddress.address_street1 &&
        validatedAddress.address_city &&
        validatedAddress.address_state &&
        validatedAddress.address_zip_code
      ) {
        // Call handleMultipleInputChange to update formData with validated address
        handleMultipleInputChange(validatedAddress);
      }
    },
    [handleMultipleInputChange] // Dependency should be the function used
  );

  const checkAndHideBudget = useCallback(() => {
    if (
      !isBudgetAdmin &&
      (formData.budget_estimates || formData.homeowner_ability)
    ) {
      const updatedFormData = {
        ...formData,
        budget_hidden: true,
      };
      handleInputChange("budget_hidden", true);
      setFormData(updatedFormData);
      // Save the hidden state to the database
    }
  }, [formData, isBudgetAdmin, setFormData, updateProjectForm, formId]);

  const initializeProjectForm = useCallback(
    async (formId) => {
      if (!formId || formId === "new") return false;

      try {
        const data = await getProjectForm(formId);
        console.log("Initializing with data:", data);
        if (data) {
          setFormData(data); // Use setFormData directly

          if (data.homeownerAbility) setActiveStep(4);
          else if (data.specificTasks) setActiveStep(3);
          else if (data.canHelp !== null) setActiveStep(2);
          else if (data.isResolved !== null) setActiveStep(1);
          else setActiveStep(0);
          return true;
        } else {
          const newProject = {
            id: formId,
          };
          const createdProject = await createProjectForm(newProject); // Assuming this creates if not exists
          if (createdProject) {
            setFormData(createdProject);
            setActiveStep(0);
            addProject(formId);
            return true;
          }
        }
      } catch (error) {
        setError(error.message);
      }
      return false;
    },
    [isBudgetAdmin]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const value = {
    activeStep,
    dayOfService,
    setActiveStep,
    formData,
    setFormData, // Include setFormData in the context value
    handleInputChange,
    saveProject,
    isInitialLoading,
    isSaving: isSavingProject || isSaving,
    handleSelectChange,
    isBudgetAuthenticated,
    error,
    checkAndHideBudget,
    initializeProjectForm,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
    getProjectForm,
    community,
    finishProject,
    updateProjectForm,
    handleNumberInputChange,
    addCollaborator,
    stakeOptions,
    wardOptions,
    isBudgetHidden: !(isBudgetAuthenticated || !formData.budget_hidden),
  };

  return (
    <ProjectFormContext.Provider value={value}>
      {children}
    </ProjectFormContext.Provider>
  );
}

export const useProjectForm = () => {
  const context = useContext(ProjectFormContext);
  if (!context) {
    throw new Error("useProjectForm must be used within a ProjectFormProvider");
  }
  return context;
};
