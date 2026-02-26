import { FIELD_TYPES } from "./FieldTypes";

export const AVAILABLE_FIELDS = {
  firstName: {
    label: "First Name",
    type: FIELD_TYPES.text,
    visible: true,
    required: true,
    originalLabel: "First Name",
    validation: (value) =>
      value.length >= 2 ? null : "First name must be at least 2 characters",
    helpText: "Enter your first name",
    category: "Personal Information",
  },

  lastName: {
    label: "Last Name",
    type: FIELD_TYPES.text,
    visible: true,
    required: true,
    originalLabel: "Last Name",
    validation: (value) =>
      value.length >= 2 ? null : "Last name must be at least 2 characters",
    helpText: "Enter your last name",
    category: "Personal Information",
  },

  email: {
    label: "Email Address",
    type: FIELD_TYPES.email,
    visible: true,
    required: true,
    originalLabel: "Email Address",
    validation: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email format",
    helpText: "We'll use this email for all course-related communications",
    category: "Contact Information",
  },
  phone: {
    label: "Phone Number",
    type: FIELD_TYPES.tel,
    visible: true,
    required: true,
    originalLabel: "Phone Number",
    validation: (value) =>
      /^\+?[\d\s-]{10,}$/.test(value) ? null : "Invalid phone number",
    helpText: "Include country code for international numbers",
    category: "Contact Information",
  },
  communicationConsent: {
    label: "Communication Consent",
    type: FIELD_TYPES.checkbox,
    visible: true,
    required: true,
    originalLabel: "Communication Consent",
    helpText:
      "I consent to being contacted via phone or email regarding my course enrollment and related communications",
    category: "Legal Information",
  },
  dob: {
    label: "Date of Birth",
    type: FIELD_TYPES.date,
    visible: true,
    required: true,
    originalLabel: "Date of Birth",
    helpText:
      "Must be at least 18 years old to enroll or have parent or guardian's consent",
    category: "Personal Information",
  },
  gender: {
    label: "Gender",
    type: FIELD_TYPES.select,
    visible: true,
    required: true,
    originalLabel: "Gender",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
    helpText: "",
    category: "Personal Information",
  },
  middleName: {
    label: "Middle Name",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Middle Name",
    category: "Personal Information",
  },
  addressLine1: {
    label: "Address Line 1",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Address Line 1",
    category: "Contact Information",
  },
  addressLine2: {
    label: "Address Line 2",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Address Line 2",
    category: "Contact Information",
  },
  city: {
    label: "City",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "City",
    category: "Contact Information",
  },
  stateProvince: {
    label: "State/Province",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "State/Province",
    category: "Contact Information",
  },
  postalCode: {
    label: "Postal Code",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Postal Code",
    category: "Contact Information",
  },
  country: {
    label: "Country",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Country",
    category: "Contact Information",
  },
  emergencyContactName: {
    label: "Emergency Contact Name",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Emergency Contact Name",
    category: "Emergency Information",
  },
  emergencyContactPhone: {
    label: "Emergency Contact Phone",
    type: FIELD_TYPES.tel,
    visible: false,
    required: false,
    originalLabel: "Emergency Contact Phone",
    category: "Emergency Information",
  },
  education: {
    label: "Education Background",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Education Background",
    category: "Background Information",
  },
  occupation: {
    label: "Occupation",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Occupation",
    category: "Background Information",
  },
  company: {
    label: "Company/Organization",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Company/Organization",
    category: "Background Information",
  },
  languages: {
    label: "Languages Spoken",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Languages Spoken",
    category: "Background Information",
  },
  additionalCourses: {
    label: "Misc. Courses Interest",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Misc. Courses Interest",
    category: "Course Information",
  },
  referral: {
    label: "How did you hear about us?",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "How did you hear about us?",
    category: "Course Information",
  },
  accessibilityNeeds: {
    label: "Accessibility Requirements",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Accessibility Requirements",
    helpText: "Please describe any accessibility accommodations you need",
    category: "Special Requirements",
  },
  skillLevel: {
    label: "Skill Level",
    type: FIELD_TYPES.select,
    visible: false,
    required: false,
    originalLabel: "Skill Level",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
    category: "Background Information",
  },
  specialRequirements: {
    label: "Special Requirements",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Special Requirements",
    category: "Course Information",
  },
  goals: {
    label: "Learning Goals",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Learning Goals",
    helpText: "What do you hope to achieve from this course?",
    category: "Course Information",
  },
  goals: {
    label: "Learning Goals",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Learning Goals",
    helpText: "What do you hope to achieve from this course?",
    category: "Course Information",
  },
  marketingConsent: {
    label: "Marketing Consent",
    type: FIELD_TYPES.checkbox,
    visible: true,
    required: false,
    originalLabel: "Marketing Consent",
    helpText: "I agree to receive updates about future courses and events",
    category: "Contact Information",
  },
  photoRelease: {
    label: "Photo Release",
    type: FIELD_TYPES.checkbox,
    visible: false,
    required: false,
    originalLabel: "Photo Release",
    helpText:
      "I agree to allow photos taken during the course to be used for promotional purposes",
    category: "Legal Information",
  },
  termsAndConditions: {
    label: "Terms and Conditions",
    type: FIELD_TYPES.checkbox,
    visible: true,
    required: true,
    originalLabel: "Terms and Conditions",
    helpText: "I agree to the terms and conditions",
    category: "Legal Information",
  },
  guardianFirstName: {
    label: "Parent/Guardian First Name",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Parent/Guardian First Name",
    validation: (value) =>
      value.length >= 2 ? null : "First name must be at least 2 characters",
    helpText: "Required for students under 18",
    category: "Parent/Guardian Information",
  },
  guardianLastName: {
    label: "Parent/Guardian Last Name",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Parent/Guardian Last Name",
    validation: (value) =>
      value.length >= 2 ? null : "Last name must be at least 2 characters",
    helpText: "Required for students under 18",
    category: "Parent/Guardian Information",
  },
  guardianEmail: {
    label: "Parent/Guardian Email",
    type: FIELD_TYPES.email,
    visible: false,
    required: false,
    originalLabel: "Parent/Guardian Email",
    validation: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email format",
    helpText: "We'll send important course updates to this email",
    category: "Parent/Guardian Information",
  },
  guardianPhone: {
    label: "Parent/Guardian Phone",
    type: FIELD_TYPES.tel,
    visible: false,
    required: false,
    originalLabel: "Parent/Guardian Phone",
    validation: (value) =>
      /^\+?[\d\s-]{10,}$/.test(value) ? null : "Invalid phone number",
    helpText: "Primary contact number for urgent communications",
    category: "Parent/Guardian Information",
  },
  guardianRelationship: {
    label: "Relationship to Student",
    type: FIELD_TYPES.select,
    visible: false,
    required: false,
    originalLabel: "Relationship to Student",
    options: [
      { value: "parent", label: "Parent" },
      { value: "legalGuardian", label: "Legal Guardian" },
      { value: "other", label: "Other" },
    ],
    helpText: "Please specify your relationship to the student",
    category: "Parent/Guardian Information",
  },
  guardianConsent: {
    label: "Parent/Guardian Consent",
    type: FIELD_TYPES.checkbox,
    visible: false,
    required: false,
    originalLabel: "Parent/Guardian Consent",
    helpText: "I give permission for my child to participate in this course",
    category: "Parent/Guardian Information",
  },
  miscConsent: {
    label: "Misc. Consent",
    type: FIELD_TYPES.checkbox,
    visible: false,
    required: false,
    originalLabel: "Misc. Consent",
    helpText: "Please check this box if you agree",
    category: "Miscellaneous",
  },
  miscTextField1: {
    label: "Misc. Text Field 1",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Misc. Text Field 1",
    helpText: "Enter additional information",
    category: "Miscellaneous",
  },
  miscTextField2: {
    label: "Misc. Text Field 2",
    type: FIELD_TYPES.text,
    visible: false,
    required: false,
    originalLabel: "Misc. Text Field 2",
    helpText: "Enter additional information",
    category: "Miscellaneous",
  },
  miscTextArea1: {
    label: "Misc. Text Area 1",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Misc. Text Area 1",
    helpText: "Enter additional detailed information",
    category: "Miscellaneous",
  },
  miscTextArea2: {
    label: "Misc. Text Area 2",
    type: FIELD_TYPES.textarea,
    visible: false,
    required: false,
    originalLabel: "Misc. Text Area 2",
    helpText: "Enter additional detailed information",
    category: "Miscellaneous",
  },
  miscCheckbox1: {
    label: "Misc. Checkbox 1",
    type: FIELD_TYPES.checkbox,
    visible: false,
    required: false,
    originalLabel: "Misc. Checkbox 1",
    helpText: "Check this box if applicable",
    category: "Miscellaneous",
  },
  miscCheckbox2: {
    label: "Misc. Checkbox 2",
    type: FIELD_TYPES.checkbox,
    visible: false,
    required: false,
    originalLabel: "Misc. Checkbox 2",
    helpText: "Check this box if applicable",
    category: "Miscellaneous",
  },

  volunteerSignature: {
    label: "Your Signature",
    type: FIELD_TYPES.signature,
    visible: true,
    required: true,
    originalLabel: "Your Signature",
    helpText:
      "By signing, I acknowledge that I have read and understood all of the terms of this release, received the Safety Training, reviewed the Volunteer Safety form, and that I am voluntarily giving up substantial legal rights, including the right to sue the Organization. / Al firmar, reconozco que he leído y comprendido todos los términos de este acuerdo, que recibí la capacitación en seguridad, que he revisado el formulario de seguridad para voluntarios, y que renuncio voluntariamente a derechos legales sustanciales, incluyendo el derecho de demandar a la Organización.*",
    category: "Days of Service",
  },

  volunteerReleaseForm: {
    label: "Volunteer Release Form",
    type: FIELD_TYPES.infoDialog,
    visible: true,
    required: true,
    originalLabel: "Volunteer Release Form",
    content: "Add your volunteer release form here...",
    category: "Days of Service",
    validation: (value) =>
      value === true ? null : "You must review the safety guidelines",
  },

  safetyGuidelines: {
    label: "Safety Rules and Guidelines",
    type: FIELD_TYPES.infoDialog,
    visible: true,
    required: true,
    originalLabel: "Safety Rules and Guidelines",
    content: "Add your safety rules and guidelines here...",
    category: "Days of Service",
    validation: (value) =>
      value === true ? null : "You must review the safety guidelines",
  },

  minorVolunteers: {
    label: "Do you have minors/children volunteering with you today?",
    type: FIELD_TYPES.minorVolunteers,
    visible: true,
    required: true,
    originalLabel: "Minor Volunteers",
    helpText:
      "Please provide information about any minors volunteering with you",
    category: "Days of Service",
    validation: (value) => {
      if (!value || value.hasMinors === undefined) {
        return "Please indicate if you have minors volunteering with you";
      }
      return null;
    },
  },

  volunteerHours: {
    label: "Volunteer Hours",
    type: FIELD_TYPES.volunteerHours,
    visible: true,
    required: true,
    originalLabel: "Volunteer Hourss",
    helpText:
      "Please provide the number of hours you intend to volunteer today",
    category: "Days of Service",
  },

  safetyVideo: {
    label: "Safety Video",
    type: FIELD_TYPES.externalLink,
    visible: true,
    required: true,
    originalLabel: "Safety Video",
    url: "https://www.youtube.com/watch?v=Dv2ZeWKZ3qg",
    helpText: "Watch the required safety video before proceeding",
    category: "Days of Service",
    validation: (value) =>
      value === true ? null : "You must watch the safety video",
  },
  dayOfService: {
    label: "Day of Service",
    type: FIELD_TYPES.dayOfService,
    visible: true,
    required: true,
    originalLabel: "Day of Service",
    options: [],
    helpText: "Please select the day you would like to volunteer",
    category: "Days of Service",
    validation: (value) => (value ? null : "Please select a day of service"),
  },

  whoAreYou: {
    label: "Where are you coming from?",
    type: FIELD_TYPES.whoAreYou,
    visible: true,
    required: true,
    originalLabel: "Where are you coming from?",
    helpText: "Please select the option that best describes you",
    category: "Days of Service",
    validation: (value) => {
      if (!value || !value.type) {
        return "Please select who you are";
      }

      // Validate based on type
      switch (value.type) {
        case "missionary":
          return value.missionary?.area
            ? null
            : "Please select your missionary area";
        case "volunteer":
          return value.volunteer?.option
            ? null
            : "Please select a volunteer option";
        case "wardMember":
          return value.wardMember?.stake && value.wardMember?.ward
            ? null
            : "Please select both stake and ward";
        case "other":
          return value.other?.source
            ? null
            : "Please select how you heard about us";
        default:
          return "Invalid selection";
      }
    },
  },
};

export const STRUCTURAL_ELEMENTS = {
  header1: {
    label: "Section Header",
    type: FIELD_TYPES.header,
    visible: true,
    required: false,
    originalLabel: "Section Header",
    content: "New Section",
    variant: "h5",
    category: "Layout Elements",
  },
  textBlock1: {
    label: "Text Block",
    type: FIELD_TYPES.staticText,
    visible: true,
    required: false,
    originalLabel: "Text Block",
    content: "Enter your text here...",
    category: "Layout Elements",
  },
  divider1: {
    label: "Divider",
    type: FIELD_TYPES.divider,
    visible: true,
    required: false,
    originalLabel: "Divider",
    category: "Layout Elements",
  },
  bannerImage: {
    label: "Banner Image",
    type: FIELD_TYPES.bannerImage,
    visible: true,
    required: false,
    originalLabel: "Banner Image",
    url: "",
    helpText: "Upload an image to display at the top of your form",
    category: "Layout Elements",
  },
};
