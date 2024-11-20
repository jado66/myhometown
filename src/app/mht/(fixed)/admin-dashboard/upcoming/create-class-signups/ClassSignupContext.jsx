"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AVAILABLE_FIELDS } from "./AvailableFields";
import { FIELD_TYPES } from "./FieldTypes";

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
  DEFAULT_BANNER_ID,
  DEFAULT_DESCRIPTION_ID,
  "firstName",
  "lastName",
  "email",
  "phone",
  "dob",
  "gender",
];

// Define default configurations for banner and description
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
  children,
  initialClassConfig,
  onClassConfigChange,
  onSubmitSignup,
  isEditMode,
  onCreateSubclass,
  onEditSubclass,
}) {
  // Form configuration state
  const [formConfig, setFormConfig] = useState(() => {
    const initialConfig = {
      ...DEFAULT_STRUCTURAL_FIELDS,
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
    return initialConfig;
  });

  // Class configuration state
  const [classConfig, setClassConfig] = useState({
    ...DEFAULT_CLASS_CONFIG,
    ...initialClassConfig,
  });

  const [fieldOrder, setFieldOrder] = useState(DEFAULT_VISIBLE_FIELDS);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleClassConfigChange = useCallback(
    (field, value) => {
      setClassConfig((prev) => {
        const newConfig = {
          ...prev,
          [field]: value,
        };

        // Notify parent component if provided
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

  const handleSaveClass = async () => {
    try {
      // if (!validateClassConfig()) {
      //   throw new Error("Please correct the errors in the form");
      // }

      const classData = {
        title: classConfig.className || "Untitled Class",
        icon: classConfig.icon || "default",
        config: {
          formConfig,
          fieldOrder,
          ...classConfig,
        },
      };

      if (classConfig._id) {
        await onEditSubclass(classConfig._id, classData);
      } else {
        const result = await onCreateSubclass(classConfig, classData);
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

  // Rest of your existing functions
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

  const value = {
    isEditMode,
    formConfig,
    classConfig,
    fieldOrder,
    formData,
    errors,
    submitStatus,
    handleClassConfigChange,
    handleSaveClass,
    handleFieldUpdate,
    handleAddElement,
    handleAddFields,
    handleRemoveField,
    handleFormChange,
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
