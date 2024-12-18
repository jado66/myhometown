export function processSignupData(classData) {
  if (!classData) {
    return null;
  }

  const { signupForm, signups } = classData;

  const fields = Object.entries(signupForm)
    .filter(
      ([_, field]) =>
        field.type !== "divider" &&
        field.type !== "header" &&
        field.type !== "staticText" &&
        field.type !== "bannerImage"
    )
    .map(([key, field]) => ({
      key,
      label: field.label,
      type: field.type,
      visible: field.visible,
      required: field.required,
    }));

  const processedSignups = signups.map((signup, index) => {
    const processedSignup = { id: `Signup ${index + 1}` };
    fields.forEach((field) => {
      processedSignup[field.key] = signup[field.key] || "";
    });
    return processedSignup;
  });

  return { fields, processedSignups };
}
