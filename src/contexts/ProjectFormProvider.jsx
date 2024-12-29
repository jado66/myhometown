// contexts/ProjectContext.js
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";

const API_BASE_URL = "/api/database/project-forms";

const ProjectFormContext = createContext();

export function ProjectFormProvider({ children, id: providedId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [addressValidation, setAddressValidation] = useState({
    isValid: false,
    isChecking: false,
    errors: {},
  });

  const [formData, setFormData] = useState({
    id: "",
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
  });

  // API Methods
  const getProjectForm = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch project form");
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const createProjectForm = async (projectData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project form");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const updateProjectForm = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
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

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Debounced save function for text fields
  const debouncedSave = useCallback(
    debounce(async (data) => {
      if (data.id) {
        setIsSaving(true);
        await updateProjectForm(data.id, data);
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  // Handle immediate save for non-text fields
  const handleImmediateSave = useCallback(async (data) => {
    if (data.id) {
      setIsSaving(true);
      await updateProjectForm(data.id, data);
      setIsSaving(false);
    }
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If it's an address field, don't save until validation
      if (field.startsWith("address")) {
        return newData;
      }

      // For text fields, use debounced save
      if (typeof value === "string" && value.length > 0) {
        debouncedSave(newData);
      } else {
        // For other fields (like radio buttons), save immediately
        handleImmediateSave(newData);
      }

      return newData;
    });
  }, []);

  const handleAddressValidated = useCallback((validatedAddress) => {
    setFormData((prev) => {
      const newData = { ...prev, ...validatedAddress };
      // Only save if all required address fields are present
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
  }, []);

  // Initialize project form
  const initializeProjectForm = useCallback(async (id) => {
    if (id) {
      const data = await getProjectForm(id);
      if (data) {
        setFormData(data);
        // Set appropriate step based on data
        if (data.homeownerAbility) setActiveStep(4);
        else if (data.specificTasks) setActiveStep(3);
        else if (data.canHelp !== null) setActiveStep(2);
        else if (data.isResolved !== null) setActiveStep(1);
        else setActiveStep(0);
      }
    } else {
      const newId = uuidv4();
      const newProject = { ...formData, id: newId };
      await createProjectForm(newProject);
      router.replace(`/project-form/${newId}`, undefined, { shallow: true });
    }
  }, []);

  useEffect(() => {
    const handleInitialization = async () => {
      if (!router) return;

      // Get ID from searchParams instead of route
      const searchParams = new URLSearchParams(window.location.search);
      const currentId = searchParams.get("id");

      if (currentId) {
        await initializeProjectForm(currentId);
      } else {
        const newId = uuidv4();
        const newProject = { ...formData, id: newId };
        await createProjectForm(newProject);
        // Update URL without changing route
        const newParams = new URLSearchParams({ id: newId });
        router.push(`?${newParams.toString()}`, undefined, { shallow: true });
      }
    };

    handleInitialization();
  }, [router]);

  // Cancel any pending debounced saves when unmounting
  useCallback(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const value = {
    activeStep,
    setActiveStep,
    formData,
    handleInputChange,
    loading,
    error,
    isSaving,
    initializeProjectForm,
    addressValidation,
    setAddressValidation,
    handleAddressValidated,
    getProjectForm,
    createProjectForm,
    updateProjectForm,
  };

  return (
    <ProjectFormContext.Provider value={value}>
      {children}
    </ProjectFormContext.Provider>
  );
}

// Custom hook to use the project context
export const useProjectForm = () => {
  const context = useContext(ProjectFormContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
