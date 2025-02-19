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

const API_BASE_URL = "/api/database/project-forms";
const ProjectFormContext = createContext();

export function ProjectFormProvider({ children, formId, date, communityId }) {
  const {
    activeStep,
    setActiveStep,
    formData,
    handleInputChange,
    addCollaborator,
    saveProject,
    isLoading,
    isSaving,
  } = useDaysOfServiceProjectForm({
    projectId: formId,
    communityId,
    daysOfServiceId: `${communityId}_${date}`,
  });

  const [community, setCommunity] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [addressValidation, setAddressValidation] = useState({
    isValid: false,
    isChecking: false,
    errors: {},
  });

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
    try {
      const response = await fetch(`${API_BASE_URL}/${formId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch project form");
      }
      const data = await response.json();

      // Remove _id and timestamps from the data before setting state
      const { _id, createdAt, updatedAt, ...formData } = data;

      const address = [
        formData.addressStreet1,
        formData.addressStreet2,
        formData.addressCity,
        formData.addressState,
        formData.addressZipCode,
      ]
        .filter(Boolean)
        .join(", ");

      const localStorageDetails = {
        propertyOwner: formData.propertyOwner,
        address,
      };

      updateProject(formId, localStorageDetails);

      console.log("Retrieved form data:", formData); // Debug log
      return formData;
    } catch (err) {
      console.error("Error fetching project form:", err); // Debug log
      setError(err.message);
      return null;
    }
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

  const handleImmediateSave = useCallback(
    async (data) => {
      if (data.id) {
        setIsSaving(true);
        try {
          await updateProjectForm(data.id, data);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [updateProjectForm]
  );

  const handleAddressValidated = useCallback(
    (validatedAddress) => {
      setFormData((prev) => {
        const newData = { ...prev, ...validatedAddress };
        if (
          validatedAddress.addressStreet1 &&
          validatedAddress.addressCity &&
          validatedAddress.addressState &&
          validatedAddress.addressZipCode
        ) {
          handleImmediateSave(newData);
        }
        return newData;
      });
    },
    [handleImmediateSave]
  );

  const initializeProjectForm = useCallback(async (formId) => {
    if (!formId || formId === "new") return false;

    try {
      const data = await getProjectForm(formId);
      console.log("Initializing with data:", data); // Debug log
      if (data) {
        setFormData((prev) => {
          console.log("Previous form data:", prev); // Debug log
          console.log("Setting new form data:", JSON.stringify(data, null, 4)); // Debug log
          return data;
        });
        if (data.homeownerAbility) setActiveStep(4);
        else if (data.specificTasks) setActiveStep(3);
        else if (data.canHelp !== null) setActiveStep(2);
        else if (data.isResolved !== null) setActiveStep(1);
        else setActiveStep(0);
        return true;
      } else {
        const newProject = {
          id: formId,
          addressStreet1: "",
          addressStreet2: "",
          addressCity: "",
          addressState: null,
          addressZipCode: "",
          propertyOwner: "",
          phoneNumber: "",
          area: "",
          violations: "",
          remedies: "",
          isResolved: null,
          canHelp: null,
          preferredRemedies: "",
          specificTasks: "",
          budget: "",
          homeownerAbility: "",
        };
        const createdProject = await createProjectForm(newProject);
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
  }, []);

  // useEffect(() => {
  //   if (formId && formId !== "new" && !hasInitialized) {
  //     setIsInitialLoading(true);
  //     initializeProjectForm(formId).then((success) => {
  //     //   setHasInitialized(success);
  //     //   setIsInitialLoading(false);
  //     });
  //   }
  // }, [formId, hasInitialized, initializeProjectForm]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const value = {
    activeStep,
    setActiveStep,
    formData,
    handleInputChange,
    isInitialLoading,
    isSaving,
    error,
    initializeProjectForm,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
    getProjectForm,
    community,
    updateProjectForm,
    addCollaborator,
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
