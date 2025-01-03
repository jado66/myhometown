"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { AVAILABLE_FIELDS } from "./AvailableFields";
import { FIELD_TYPES } from "./FieldTypes";
import { useLoadedClassesContext } from "@/hooks/use-loaded-classes-context";
import Loading from "@/components/util/Loading";
import { useClasses } from "@/hooks/use-classes";
import { toast } from "react-toastify";
import { Box, Divider, Typography } from "@mui/material";

const ClassSignupContext = createContext(null);

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_BANNER_ID = "classBanner";
const DEFAULT_DESCRIPTION_ID = "classDescription";

const DEFAULT_VISIBLE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dob",
  "gender",
];

const DEFAULT_STRUCTURAL_FIELDS = {
  [DEFAULT_DESCRIPTION_ID]: {
    type: FIELD_TYPES.staticText,
    label: "Class Description Text",
    originalLabel: "Class Description Text",
    content:
      "Welcome to the class! Please fill out the registration form below.",
    visible: true,
  },
};

const DEFAULT_CLASS_CONFIG = {
  title: "",
  categoryId: "default",
  startDate: "",
  endDate: "",
  meetings: [],
  classBannerUrl: null,
  location: "",
  capacity: "",
  showCapacity: false,
  icon: "default",
  description: "",
};

export function ClassSignupProvider({
  children,
  classObj,
  defaultConfig,
  onCreateSubclass,
  category,
  onEditSubclass,
  onDeleteSubclass,
  isNew = false,
  isEditMode = false,
}) {
  const loadedClassesContext = !isNew ? useLoadedClassesContext() : null;
  const { signupForClass } = useClasses();

  const [isLoading, setIsLoading] = useState(classObj?.id ? true : false);
  const [loadError, setLoadError] = useState(null);
  const hasLoadedRef = useRef(false);

  // Initialize form configuration
  const [formConfig, setFormConfig] = useState(() => {
    if (defaultConfig?.formConfig) {
      return defaultConfig.formConfig;
    }

    const newFormConfig = DEFAULT_VISIBLE_FIELDS.reduce((acc, key) => {
      if (!DEFAULT_STRUCTURAL_FIELDS[key]) {
        acc[key] = {
          ...AVAILABLE_FIELDS[key],
          visible: true,
        };
      }
      return acc;
    }, {});

    return newFormConfig;
  });

  // Initialize class configuration
  const [classConfig, setClassConfig] = useState(() => {
    if (defaultConfig) {
      // If we have default config (e.g., for duplicating), use that
      return {
        ...DEFAULT_CLASS_CONFIG,
        ...defaultConfig,
        categoryId: category.id,
        id: undefined, // Ensure we don't carry over the ID
      };
    } else if (classObj && !isNew) {
      // If we're editing an existing class
      return {
        ...DEFAULT_CLASS_CONFIG,
        ...classObj,
        categoryId: category.id,
      };
    }
    // Otherwise use defaults
    return { ...DEFAULT_CLASS_CONFIG, categoryId: category.id };
  });

  const [fieldOrder, setFieldOrder] = useState(() => {
    if (defaultConfig?.fieldOrder) {
      return defaultConfig.fieldOrder;
    }
    return DEFAULT_VISIBLE_FIELDS;
  });

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isConfigDirty, setIsConfigDirty] = useState(false);

  const initialFormConfigRef = useRef(formConfig);
  const initialClassConfigRef = useRef(classConfig);

  // Track changes for dirty state
  useEffect(() => {
    const isFormConfigDirty =
      JSON.stringify(formConfig) !==
      JSON.stringify(initialFormConfigRef.current);
    const isClassConfigDirty =
      JSON.stringify(classConfig) !==
      JSON.stringify(initialClassConfigRef.current);
    setIsConfigDirty(isFormConfigDirty || isClassConfigDirty);
  }, [formConfig, classConfig]);

  // Load existing class data
  useEffect(() => {
    async function loadClassData() {
      if (
        !classObj?.id ||
        isNew ||
        hasLoadedRef.current ||
        !loadedClassesContext
      )
        return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const loadedClass = await loadedClassesContext.loadClass(classObj.id);
        if (!loadedClass) {
          throw new Error(`Could not find class with ID ${classObj.id}`);
        }

        // Update form configuration
        if (loadedClass.signupForm) {
          setFormConfig(loadedClass.signupForm.formConfig);
          initialFormConfigRef.current = loadedClass.signupForm;
        }

        // Update class configuration
        const newClassConfig = {
          ...DEFAULT_CLASS_CONFIG,
          title: loadedClass.title || "",
          categoryId: loadedClass.categoryId || "",
          description: loadedClass.description || "",
          icon: loadedClass.icon || "default",
          startDate: loadedClass.startDate || "",
          endDate: loadedClass.endDate || "",
          location: loadedClass.location || "",
          capacity: loadedClass.capacity || "",
          showCapacity: loadedClass.showCapacity || false,
          meetingDays: loadedClass.meetings?.map((m) => m.day) || [],
          startTime: loadedClass.meetings?.[0]?.startTime || "",
          endTime: loadedClass.meetings?.[0]?.endTime || "",
          id: loadedClass.id,
        };

        setClassConfig(newClassConfig);
        initialClassConfigRef.current = newClassConfig;

        // Update field order
        if (loadedClass.fieldOrder) {
          setFieldOrder(loadedClass.fieldOrder);
        }

        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading class:", error);
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadClassData();
  }, [classObj?.id, isNew, loadedClassesContext]);

  const handleClassConfigChange = useCallback((field, value) => {
    setClassConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validateClassConfig = () => {
    const newErrors = {};
    const now = new Date();
    const startDate = new Date(classConfig.startDate);
    const endDate = new Date(classConfig.endDate);

    // Add debug logging
    console.log("Validating class config:", classConfig);

    // Title validation
    if (!classConfig.title?.trim()) {
      newErrors.title = "Class name is required";
    } else if (classConfig.title.length < 3) {
      newErrors.title = "Class name must be at least 3 characters long";
    }

    // Description validation
    if (!classConfig.description?.trim()) {
      newErrors.description = "Class description is required";
    }

    // Date validation
    if (!classConfig.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      try {
        if (startDate < now) {
          newErrors.startDate = "Start date must be in the future";
        }
      } catch (e) {
        newErrors.startDate = "Invalid start date format";
      }
    }

    if (!classConfig.endDate) {
      newErrors.endDate = "End date is required";
    } else {
      try {
        if (endDate < startDate) {
          newErrors.endDate = "End date must be after start date";
        }
      } catch (e) {
        newErrors.endDate = "Invalid end date format";
      }
    }

    // Meeting validation - check either meetingDays or meetings
    const hasMeetings =
      classConfig.meetings &&
      Array.isArray(classConfig.meetings) &&
      classConfig.meetings.length > 0;
    const hasMeetingDays =
      classConfig.meetingDays &&
      Array.isArray(classConfig.meetingDays) &&
      classConfig.meetingDays.length > 0;

    if (!hasMeetings && !hasMeetingDays) {
      newErrors.meetingDays = "At least one meeting day is required";
    }

    // Location validation
    if (!classConfig.location?.trim()) {
      newErrors.location = "Location is required";
    }

    // Capacity validation
    if (classConfig.capacity) {
      const capacityNum = parseInt(classConfig.capacity);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        newErrors.capacity = "Capacity must be a positive number";
      }
    }

    // Icon validation
    if (!classConfig.icon) {
      newErrors.icon = "Please select an icon for the class";
    }

    // Log validation results
    console.log("Validation errors:", newErrors);

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSaveClass = async () => {
    try {
      const validationResult = validateClassConfig();
      if (!validationResult.isValid) {
        // Show all validation errors as toasts
        Object.values(validationResult.errors).forEach((error) => {
          toast.error(error);
        });
        throw new Error("Please correct all highlighted fields");
      }

      if (classConfig.id && !isNew) {
        // alert("Trying to updated class");
        await onEditSubclass(classConfig, {
          formConfig,
          fieldOrder,
        });
        // toast.success("Class updated successfully!");
      } else {
        // alert("Trying to create new class");
        await onCreateSubclass(classConfig, {
          formConfig,
          fieldOrder,
        });
        // toast.success("New class created successfully!");
      }

      return true;
    } catch (error) {
      console.error("Failed to save class", error);

      // const classData = {
      //   ...classConfig,
      //   signupForm: {
      //     formConfig,
      //     fieldOrder,
      //   },
      // };

      // console.log(
      //   "Error saving class with data:",
      //   JSON.stringify(classData, null, 4)
      // ); // Debug log

      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));
      // Show a more detailed error message
      toast.error(`Failed to save class: ${error.message}`);
      throw error;
    }
  };

  const handleDeleteClass = async () => {
    if (!classConfig.id) return;
    try {
      await onDeleteSubclass(classConfig.id);
    } catch (error) {
      console.error("Failed to delete class", error);
      throw error;
    }
  };

  const handleFieldUpdate = (field, newConfig) => {
    setFormConfig((prev) => ({
      ...prev,
      [field]: newConfig,
    }));
  };

  const handleAddElement = (elementId, elementConfig) => {
    setFormConfig((prev) => ({
      ...prev,
      [elementId]: elementConfig,
    }));
    setFieldOrder((prev) => [...prev, elementId]);
  };

  const handleAddFields = (newFields) => {
    const newConfig = { ...formConfig };
    const newOrder = [...fieldOrder];

    newFields.forEach((field) => {
      if (AVAILABLE_FIELDS[field]) {
        newConfig[field] = {
          ...AVAILABLE_FIELDS[field],
          visible: true,
        };
        newOrder.push(field);
      }
    });

    setFormConfig(newConfig);
    setFieldOrder(newOrder);
  };

  const handleRemoveField = (fieldToRemove) => {
    const newConfig = { ...formConfig };
    delete newConfig[fieldToRemove];
    setFormConfig(newConfig);
    setFieldOrder(fieldOrder.filter((field) => field !== fieldToRemove));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(fieldOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFieldOrder(items);
  };

  const validateForm = (formData) => {
    const newErrors = {};

    Object.entries(formConfig).forEach(([fieldId, config]) => {
      if (config.required) {
        if (config.type === FIELD_TYPES.checkbox) {
          if (!formData[fieldId]) {
            newErrors[fieldId] = `${config.label} is required`;
          }
        } else if (
          !formData[fieldId] ||
          (typeof formData[fieldId] === "string" &&
            formData[fieldId].trim() === "")
        ) {
          newErrors[fieldId] = `${config.label} is required`;
        }
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitStatus("submitting");

      if (!validateForm(formData)) {
        setSubmitStatus("error");
        return;
      }

      const result = await signupForClass(classObj.id, formData);

      if (!result) {
        throw new Error("Signup failed");
      }

      setFormData({});
      setSubmitStatus("success");
      toast.success("Signup successful!");
    } catch (error) {
      console.error("Error submitting signup:", error);

      // Check if the error is specifically about the class being full
      const errorMessage =
        error.message === "Class is full"
          ? "Sorry! This class is full."
          : error.message || "Failed to submit signup";

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
      setSubmitStatus("error");
      toast.error(errorMessage);
    }
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading class: {loadError}
      </div>
    );
  }

  const value = {
    formConfig,
    classConfig,
    fieldOrder,
    formData,
    errors,
    submitStatus,
    originalClassObj: classObj,
    isConfigDirty,
    isEditMode,
    isLoading,
    isNew,
    handleClassConfigChange,
    handleSaveClass,
    handleDeleteClass,
    handleFieldUpdate,
    handleAddElement,
    handleAddFields,
    handleRemoveField,
    handleFormChange,
    handleSubmit,
    onDragEnd,
    DAYS_OF_WEEK,
  };

  return (
    <ClassSignupContext.Provider value={value}>
      {children}
    </ClassSignupContext.Provider>
  );
}

export function useClassSignup() {
  const context = useContext(ClassSignupContext);
  if (!context) {
    throw new Error("useClassSignup must be used within a ClassSignupProvider");
  }
  return context;
}
