// CSV Helper Functions

export const exportContacts = (contacts) => {
  const header = "First Name,Middle Name,Last Name,Email,Phone,Groups\n";
  const csv = contacts
    .map(
      (contact) =>
        `${contact.first_name || ""},${contact.middle_name || ""},${
          contact.last_name || ""
        },${contact.email || ""},${contact.phone || ""},${
          Array.isArray(contact.groups)
            ? contact.groups.join(";")
            : typeof contact.groups === "string"
              ? contact.groups
              : ""
        }`,
    )
    .join("\n");

  const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "contacts.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const normalizeHeader = (header) => {
  // Remove special characters and spaces, convert to lowercase
  const normalized = header.toLowerCase().trim();

  // Map various possible header names to standard format
  const headerMap = {
    "first name": "first_name",
    firstname: "first_name",
    "last name": "last_name",
    lastname: "last_name",
    "middle name": "middle_name",
    middlename: "middle_name",
    "contact name": "name",
    contactname: "name",
    email: "email",
    "email address": "email",
    emailaddress: "email",
    mail: "email",
    phone: "phone",
    "phone number": "phone",
    phonenumber: "phone",
    telephone: "phone",
    tel: "phone",
    mobile: "phone",
    cell: "phone",
    cellphone: "phone",
    group: "groups",
    groups: "groups",
    category: "groups",
    categories: "groups",
    tags: "groups",
  };

  return headerMap[normalized] || normalized.replace(/[^a-z0-9]/g, "");
};

export const parseGroups = (groupsData) => {
  if (!groupsData) return [];

  // If already an array, return it
  if (Array.isArray(groupsData)) return groupsData;

  // If it's a string, try to parse it as JSON
  if (typeof groupsData === "string") {
    try {
      return JSON.parse(groupsData);
    } catch (error) {
      console.error("Failed to parse groups:", error);
      return [];
    }
  }

  return [];
};
