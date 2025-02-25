// Field validation rules for different data types
const validateField = {
  // Boolean fields just need to be true
  boolean: (value) => Boolean(value),

  // Text fields should have non-empty content
  text: (value) => Boolean(value && value.trim().length > 0),

  // Integer fields should be numbers and non-zero
  integer: (value) => typeof value === "number" && !isNaN(value) && value > 0,

  // Numeric fields should be valid numbers
  numeric: (value) => typeof value === "number" && !isNaN(value) && value >= 0,

  // Array fields should have at least one item
  ARRAY: (value) => Array.isArray(value) && value.length > 0,

  // JSONB fields should be valid objects with content
  jsonb: (value) => {
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Boolean(
        parsed && typeof parsed === "object" && Object.keys(parsed).length > 0
      );
    } catch {
      return false;
    }
  },
};

// Function to get the completion status of a field
function getFieldStatus(fieldName, value, fieldType) {
  // If the value is null or undefined, it's not started
  if (value === null || value === undefined) {
    return "none";
  }

  // Get the appropriate validator function
  const validator = validateField[fieldType];
  if (!validator) {
    console.warn(`No validator found for field type: ${fieldType}`);
    return "none";
  }

  // Special case handling for certain fields
  switch (fieldName) {
    case "budget":
      // Budget might need both numeric value and approval status
      return validateBudget(value);

    case "homeowner_ability":
      // Homeowner ability might need assessment and confirmation
      return validateHomeownerAbility(value);

    case "preferred_remedies":
      // Remedies might need to be both listed and approved
      return validatePreferredRemedies(value);

    case "materials_procured":
      // Materials procurement might be partially complete
      return validateMaterialsProcurement(value);

    default:
      // Use the standard validator for the field type
      return validator(value) ? "done" : "none";
  }
}

// Specialized validation functions for complex fields
function validateBudget(value) {
  if (!value) return "none";

  try {
    // If it's a string, try to parse it
    const budgetData = typeof value === "string" ? JSON.parse(value) : value;

    // Check if we have both amount and approval
    if (typeof budgetData === "object") {
      const hasAmount = Boolean(
        budgetData.amount && !isNaN(Number(budgetData.amount))
      );
      const isApproved = Boolean(budgetData.approved);

      if (hasAmount && isApproved) return "done";
      if (hasAmount) return "progress";
    } else if (!isNaN(Number(value))) {
      // If it's just a number, consider it in progress
      return "progress";
    }
  } catch {
    // If it's just a non-empty string, consider it started
    return value.trim().length > 0 ? "progress" : "none";
  }

  return "none";
}

function validateHomeownerAbility(value) {
  if (!value) return "none";

  try {
    const abilityData = typeof value === "string" ? JSON.parse(value) : value;

    if (typeof abilityData === "object") {
      const hasAssessment = Boolean(abilityData.assessment);
      const hasConfirmation = Boolean(abilityData.confirmed);

      if (hasAssessment && hasConfirmation) return "done";
      if (hasAssessment) return "progress";
    }
  } catch {
    // If it's a non-empty string, consider it in progress
    return value.trim().length > 0 ? "progress" : "none";
  }

  return "none";
}

function validatePreferredRemedies(value) {
  if (!value) return "none";

  try {
    const remediesData = typeof value === "string" ? JSON.parse(value) : value;

    if (Array.isArray(remediesData)) {
      if (remediesData.length === 0) return "none";

      // Check if all remedies are approved
      const allApproved = remediesData.every((remedy) => remedy.approved);
      if (allApproved) return "done";
      return "progress";
    } else if (typeof remediesData === "object") {
      const hasRemedies = Boolean(Object.keys(remediesData).length);
      const allApproved = Object.values(remediesData).every((v) => v === true);

      if (hasRemedies && allApproved) return "done";
      if (hasRemedies) return "progress";
    }
  } catch {
    // If it's a non-empty string, consider it in progress
    return value.trim().length > 0 ? "progress" : "none";
  }

  return "none";
}

function validateMaterialsProcurement(value) {
  if (!value) return "none";

  try {
    const materialsData = typeof value === "string" ? JSON.parse(value) : value;

    if (typeof materialsData === "object") {
      const totalItems = Object.keys(materialsData).length;
      const procuredItems = Object.values(materialsData).filter(
        (v) => v === true
      ).length;

      if (totalItems === 0) return "none";
      if (totalItems === procuredItems) return "done";
      if (procuredItems > 0) return "progress";
    } else if (typeof materialsData === "boolean") {
      return materialsData ? "done" : "none";
    }
  } catch {
    // If it's a boolean directly
    return value === true ? "done" : "none";
  }

  return "none";
}

// Get project status for a group of fields
function validateProjectFields(project, fields, availableFields) {
  return fields.map((fieldName) => {
    const fieldInfo = availableFields.find((f) => f.column_name === fieldName);
    if (!fieldInfo) {
      console.warn(`Field not found in available fields: ${fieldName}`);
      return "none";
    }

    return getFieldStatus(fieldName, project[fieldName], fieldInfo.data_type);
  });
}

export { getFieldStatus, validateProjectFields };
