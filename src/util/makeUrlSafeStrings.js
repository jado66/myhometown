export const makeUrlSafeString = (str) => {
  if (!str) {
    return "";
  }

  return (
    str
      // Convert to lowercase
      .toLowerCase()
      // Replace spaces with hyphens
      .replace(/ /g, "-")
      // Remove all non-alphanumeric characters except hyphens and underscores
      .replace(/[^a-z0-9-_]/g, "")
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
};
