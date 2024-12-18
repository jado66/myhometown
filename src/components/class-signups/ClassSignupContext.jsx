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
  className: "",
  startDate: "",
  endDate: "",
  meetingDays: [],
  startTime: "",
  endTime: "",
  location: "",
  capacity: "",
  showCapacity: false,
  icon: "default",
};

export function ClassSignupProvider({
  classObj,
  children,
  initialClassConfig,
  onClassConfigChange,
  isEditMode,
  isNew,
  onCreateSubclass,
  onEditSubclass,
  onDeleteSubclass,
}) {
  const loadedClassesContext = !isNew ? useLoadedClassesContext() : null;

  const { signupForClass } = useClasses();

  const [isLoading, setIsLoading] = useState(classObj?.id ? true : false);
  const [loadError, setLoadError] = useState(null);
  const hasLoadedRef = useRef(false);

  const initialFormConfigRef = useRef(null);
  const initialClassConfigRef = useRef(null);

  // Form configuration state
  const [formConfig, setFormConfig] = useState(() => {
    const initialConfig = {
      ...DEFAULT_VISIBLE_FIELDS.reduce((acc, key) => {
        if (!DEFAULT_STRUCTURAL_FIELDS[key]) {
          acc[key] = {
            ...AVAILABLE_FIELDS[key],
            visible: true,
          };
        }
        return acc;
      }, {}),
    };
    initialFormConfigRef.current = initialConfig;
    return initialConfig;
  });

  // Class configuration state
  const [classConfig, setClassConfig] = useState(() => {
    const config = {
      ...DEFAULT_CLASS_CONFIG,
      ...initialClassConfig,
    };
    initialClassConfigRef.current = config;
    return config;
  });

  const [fieldOrder, setFieldOrder] = useState(DEFAULT_VISIBLE_FIELDS);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isConfigDirty, setIsConfigDirty] = useState(false);

  const checkConfigDirty = useCallback(() => {
    const isFormConfigDirty =
      JSON.stringify(formConfig) !==
      JSON.stringify(initialFormConfigRef.current);
    const isClassConfigDirty =
      JSON.stringify(classConfig) !==
      JSON.stringify(initialClassConfigRef.current);

    setIsConfigDirty(isFormConfigDirty || isClassConfigDirty);
  }, [formConfig, classConfig]);

  useEffect(() => {
    checkConfigDirty();
  }, [formConfig, classConfig, checkConfigDirty]);

  useEffect(() => {
    async function loadClassData() {
      if (!classObj?.id || isNew || hasLoadedRef.current) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        // Use loadedClassesContext to load the class data
        const loadedClass = await loadedClassesContext.loadClass(classObj.id);

        if (!loadedClass) {
          throw new Error(`Could not find class with ID ${classObj.id}`);
        }

        // Update form configuration
        if (loadedClass.signupForm) {
          const newFormConfig = loadedClass.signupForm;
          setFormConfig(newFormConfig);
          initialFormConfigRef.current = newFormConfig;
        }

        // Update class configuration
        const newClassConfig = {
          ...DEFAULT_CLASS_CONFIG,
          className: loadedClass.title || "",
          icon: loadedClass.icon || "default",
          startDate: loadedClass.startDate || "",
          endDate: loadedClass.endDate || "",
          location: loadedClass.location || "",
          capacity: loadedClass.capacity || "",
          showCapacity: loadedClass.showCapacity || false,
          meetingDays: loadedClass.meetings?.map((m) => m.day) || [],
          startTime: loadedClass.meetings?.[0]?.startTime || "",
          endTime: loadedClass.meetings?.[0]?.endTime || "",
          _id: loadedClass.id,
        };

        setClassConfig(newClassConfig);
        initialClassConfigRef.current = newClassConfig;

        // Update field order
        if (loadedClass.fieldOrder) {
          setFieldOrder(loadedClass.fieldOrder);
        }

        setIsConfigDirty(false);
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

  const handleClassConfigChange = useCallback(
    (field, value) => {
      setClassConfig((prev) => {
        const newConfig = {
          ...prev,
          [field]: value,
        };

        if (onClassConfigChange) {
          onClassConfigChange(newConfig);
        }

        return newConfig;
      });
    },
    [onClassConfigChange]
  );

  const validateClassConfig = () => {
    const newErrors = {};
    const now = new Date();
    const startDate = new Date(classConfig.startDate);
    const endDate = new Date(classConfig.endDate);

    if (!classConfig.className.trim()) {
      newErrors.className = "Class name is required";
    }

    if (!classConfig.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (startDate < now) {
      newErrors.startDate = "Start date must be in the future";
    }

    if (!classConfig.endDate) {
      newErrors.endDate = "End date is required";
    } else if (endDate < startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!classConfig.meetingDays.length) {
      newErrors.meetingDays = "At least one meeting day is required";
    }

    if (!classConfig.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!classConfig.endTime) {
      newErrors.endTime = "End time is required";
    } else if (
      classConfig.startTime &&
      classConfig.endTime <= classConfig.startTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!classConfig.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      classConfig.capacity &&
      (isNaN(classConfig.capacity) || Number(classConfig.capacity) < 1)
    ) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteClass = async () => {
    try {
      await onDeleteSubclass(classConfig._id);
    } catch (error) {
      console.error("Failed to delete class", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));
      throw error;
    }
  };

  const handleSaveClass = async () => {
    try {
      // if (!validateClassConfig()) {
      //   throw new Error("Please correct the errors in the form");
      // }

      if (classConfig._id) {
        await onEditSubclass(classConfig, formConfig);
      } else {
        const result = await onCreateSubclass(classConfig, formConfig);
        if (result) {
          // Reset form after successful creation
          setFormConfig({});
          setFieldOrder([]);
          setClassConfig(DEFAULT_CLASS_CONFIG);
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to save class", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));
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
      newConfig[field] = {
        ...AVAILABLE_FIELDS[field],
        visible: true,
      };
      newOrder.push(field);
    });

    setFormConfig(newConfig);
    setFieldOrder(newOrder);
  };

  const validateForm = (formData) => {
    const newErrors = {};

    // Validate required fields
    Object.entries(formConfig).forEach(([fieldId, config]) => {
      if (
        config.required &&
        (!formData[fieldId] || formData[fieldId].trim() === "")
      ) {
        newErrors[fieldId] = `${config.label} is required`;
      }
    });

    // Validate email format if email field exists and has value
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone format if phone field exists and has value
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitStatus("submitting");

      // Validate form
      if (!validateForm(formData)) {
        setSubmitStatus("error");
        return;
      }

      // Use the useClasses hook for submission
      const result = await signupForClass(classObj.id, formData);

      if (!result) {
        throw new Error("Signup failed");
      }

      // Clear form data and set success status
      setFormData({});
      setSubmitStatus("success");

      await signupForClass(classObj.id, formData);

      toast.success("Signup successful!");
    } catch (error) {
      console.error("Error submitting signup:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to submit signup",
      }));
      setSubmitStatus("error");
    }
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

  if (isLoading) {
    return (
      <>
        Loading
        <Loading />
      </>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading class: {loadError}
      </div>
    );
  }

  const value = {
    isEditMode,
    formConfig,
    classConfig,
    fieldOrder,
    formData,
    errors,
    submitStatus,
    isConfigDirty,
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
