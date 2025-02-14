import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { useLocalStorageProjectForms } from "@/hooks/use-local-storage-project-forms";

const API_BASE_URL = "/api/database/project-forms";
const ProjectFormContext = createContext();

export function ProjectFormProvider({ children, id }) {
  const router = useRouter();
  const { addProject, updateProject, getProject } =
    useLocalStorageProjectForms();

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [addressValidation, setAddressValidation] = useState({
    isValid: false,
    isChecking: false,
    errors: {},
  });

  const [formData, setFormData] = useState({
    id: id || "",
    addressStreet1: "",
    addressStreet2: "",
    addressCity: "",
    addressState: null,
    addressZipCode: "",
    propertyOwner: "",
    phoneNumber: "",
    area: "",
    tasks: [
      {
        id: "1",
        priority: 1,
        todos: [""],
        photos: [],
        equipment: [],
      },
    ],
    isAddressVerified: false,
    violations: "",
    remedies: "",
    isResolved: null,
    canHelp: null,
    preferredRemedies: "",
    specificTasks: "",
    budget: "",
    homeownerAbility: "",
    collaborators: [],
  });

  const getProjectForm = useCallback(
    async (formId) => {
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

        if (!getProject(formId)) {
          addProject(formId, localStorageDetails);
        } else {
          updateProject(formId, localStorageDetails);
        }

        console.log("Retrieved form data:", formData); // Debug log
        return formData;
      } catch (err) {
        console.error("Error fetching project form:", err); // Debug log
        setError(err.message);
        return null;
      }
    },
    [addProject, updateProject, getProject]
  );

  const createProjectForm = useCallback(async (projectData) => {
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

      return await response.json();
    } catch (err) {
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

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Special handling for tasks to ensure immediate save
        if (field === "tasks") {
          handleImmediateSave(newData);
          return newData;
        }

        // Existing address handling logic
        if (field.startsWith("address")) {
          const address = [
            newData.addressStreet1,
            newData.addressStreet2,
            newData.addressCity,
            newData.addressState,
            newData.addressZipCode,
          ]
            .filter(Boolean)
            .join(", ");

          updateProject(newData.id, {
            propertyOwner: newData.propertyOwner,
            address,
          });
        }

        // Existing propertyOwner handling
        if (field === "propertyOwner") {
          updateProject(newData.id, {
            propertyOwner: value,
            address: getProject(newData.id)?.address || "",
          });
        }

        // Use debounced save for string values, immediate save for others
        if (typeof value === "string") {
          debouncedSave(newData);
        } else {
          handleImmediateSave(newData);
        }

        return newData;
      });
    },
    [debouncedSave, handleImmediateSave, updateProject, getProject]
  );

  const addCollaborator = useCallback(
    (collaborator) => {
      setFormData((prev) => {
        // Ensure collaborators exists, default to empty array if not
        const existingCollaborators = prev.collaborators || [];

        const newCollaborators = [...existingCollaborators, collaborator];

        const newData = {
          ...prev,
          collaborators: newCollaborators,
        };

        handleImmediateSave(newData);

        return newData;
      });
    },
    [handleImmediateSave]
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

  const initializeProjectForm = useCallback(
    async (formId) => {
      if (!formId || formId === "new") return false;

      try {
        const data = await getProjectForm(formId);
        console.log("Initializing with data:", data); // Debug log
        if (data) {
          setFormData((prev) => {
            console.log("Previous form data:", prev); // Debug log
            console.log(
              "Setting new form data:",
              JSON.stringify(data, null, 4)
            ); // Debug log
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
    },
    [getProjectForm, createProjectForm, addProject]
  );

  useEffect(() => {
    if (id && id !== "new" && !hasInitialized) {
      setIsInitialLoading(true);
      initializeProjectForm(id).then((success) => {
        setHasInitialized(success);
        setIsInitialLoading(false);
      });
    }
  }, [id, hasInitialized, initializeProjectForm]);

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
    createProjectForm,
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
