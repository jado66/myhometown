// ClassDetailTable.utils.js
import { FIELD_TYPES } from "@/components/class-signups/FieldTypes";
import { AVAILABLE_FIELDS } from "@/components/class-signups/AvailableFields";

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export const getStudentAttendance = (classData, studentId) => {
  if (!classData?.attendance || !Array.isArray(classData.attendance)) {
    return { count: 0, dates: [] };
  }

  const attendanceRecords = classData.attendance.filter(
    (record) => record.studentId === studentId && record.present === true
  );

  return {
    count: attendanceRecords.length,
    dates: attendanceRecords.map((record) => record.date),
    lastAttended:
      attendanceRecords.length > 0
        ? attendanceRecords.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )[0].date
        : null,
  };
};

export const getFieldConfig = (fieldKey, formConfig) => {
  const customConfig = formConfig[fieldKey] || {};
  const baseConfig = AVAILABLE_FIELDS[fieldKey] || {};
  const fieldType = baseConfig.type || customConfig.type || FIELD_TYPES.text;

  return {
    ...baseConfig,
    ...customConfig,
    type: fieldType,
    label: customConfig.label || baseConfig.label || fieldKey,
    required: customConfig.required ?? baseConfig.required ?? false,
    options: baseConfig.options || customConfig.options,
  };
};

export const isStructuralElement = (type) => {
  return [
    FIELD_TYPES.divider,
    FIELD_TYPES.header,
    FIELD_TYPES.staticText,
    FIELD_TYPES.bannerImage,
  ].includes(type);
};

export const validateField = (fieldKey, value, formConfig) => {
  const field = getFieldConfig(fieldKey, formConfig);

  if (field.required && !value && value !== false) {
    return `${field.label} is required`;
  }

  if (field.validation && value) {
    const validationResult = field.validation(value);
    if (validationResult) {
      return validationResult;
    }
  }

  if (value) {
    switch (field.type) {
      case "tel":
        if (!/^\+?[\d\s-]{10,}$/.test(value)) {
          return "Invalid phone number format";
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email format";
        }
        break;
    }
  }

  return null;
};
