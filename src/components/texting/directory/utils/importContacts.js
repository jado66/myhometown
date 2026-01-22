import { formatPhoneNumber } from "@/util/formatting/format-phone-number";
import { normalizeHeader, parseGroups } from "./csvHelpers";

// Function to import contacts from CSV
export const importContacts = async (
  event,
  addContact,
  bulkAddContacts,
  bulkUpdateContacts,
  setFormError,
  refreshContacts,
  userId,
  currentContacts,
) => {
  const file = event.target.files[0];
  if (!file) {
    console.log("No file selected for import");
    return null;
  }

  console.log("Starting CSV import for file:", file.name);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        console.log("File content length:", content.length);
        const lines = content.split("\n").filter((line) => line.trim());
        console.log("Total lines after filtering:", lines.length);

        if (lines.length === 0) {
          const errorMsg = "CSV file is empty";
          console.error(errorMsg);
          setFormError(errorMsg);
          event.target.value = null;
          resolve({
            imported: 0,
            merged: 0,
            errors: 1,
            errorDetails: [errorMsg],
            duplicateDetails: [],
          });
          return;
        }

        const errors = [];
        const contactsToAdd = [];
        const contactsToUpdate = [];
        const duplicates = [];

        // Get and normalize headers
        console.log("Raw headers:", lines[0]);
        const allowedHeaders = [
          "first_name",
          "last_name",
          "email",
          "phone",
          "groups",
          "middle_name",
        ];
        const rawHeaders = lines[0].split(",").map((header) => header.trim());
        const headerMapping = [];
        const headers = [];

        rawHeaders.forEach((header, index) => {
          const normalized = normalizeHeader(header);
          if (allowedHeaders.includes(normalized)) {
            headers.push(normalized);
            headerMapping.push({
              originalIndex: index,
              normalizedName: normalized,
            });
          } else {
            console.warn(`Ignoring unknown column: ${header}`);
          }
        });

        console.log("Normalized headers:", headers);
        console.log("Header mapping:", headerMapping);

        // Check for required headers
        const requiredHeaders = ["first_name", "last_name", "phone"];
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header),
        );

        if (missingHeaders.length > 0) {
          const errorMsg = `Missing required columns: ${missingHeaders.join(
            ", ",
          )}`;
          console.error(errorMsg);
          setFormError(errorMsg);
          event.target.value = null;
          resolve({
            imported: 0,
            merged: 0,
            errors: 1,
            errorDetails: [errorMsg],
            duplicateDetails: [],
          });
          return;
        }

        console.log("Processing", lines.length - 1, "data lines");

        // Process each line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue; // Skip empty lines

          console.log(`Processing line ${i + 1}:`, line);
          const allValues = line.split(",").map((val) => val.trim());

          // Extract only the values for columns we care about
          const values = headerMapping.map(
            (mapping) => allValues[mapping.originalIndex] || "",
          );

          console.log(`Extracted values for known columns:`, values);

          // Check if we have fewer values than expected headers (missing data)
          if (values.length < headers.length) {
            const error = `Line ${i + 1}: Too few columns (expected ${
              headers.length
            }, got ${values.length})`;
            console.error(error);
            errors.push(error);
            continue;
          }

          // Create contact object using header mapping
          const contact = {
            first_name: "",
            last_name: "",
            middle_name: "",
            email: "",
            phone: "",
            owner_type: "user",
            owner_id: userId,
            groups: [],
          };

          // Map values to correct fields
          headers.forEach((header, j) => {
            if (header === "groups") {
              const groupsArray = values[j].split(";").filter(Boolean);
              contact.groups = groupsArray.map((group) => group.trim());
            } else if (header === "phone") {
              contact[header] = formatPhoneNumber(values[j]);
            } else {
              contact[header] = values[j];
            }
          });

          console.log(`Contact created for line ${i + 1}:`, contact);

          // Validate the contact
          if (!contact.first_name || !contact.last_name || !contact.phone) {
            const error = `Line ${i + 1}: Missing required fields (first_name: ${
              contact.first_name
            }, last_name: ${contact.last_name}, phone: ${contact.phone})`;
            console.error(error);
            errors.push(error);
            continue;
          }

          // Check for duplicates and merge groups if found
          const existingContact = Object.values(currentContacts || {})
            .flat()
            .find((c) => c && c.phone && c.phone === contact.phone);

          if (existingContact) {
            // Parse existing groups
            const existingGroups = parseGroups(existingContact.groups) || [];
            const newGroups = contact.groups || [];

            // Merge groups, removing duplicates
            const mergedGroupsSet = new Set([
              ...existingGroups.map((g) =>
                typeof g === "string" ? g : g.value || g.label,
              ),
              ...newGroups.map((g) =>
                typeof g === "string" ? g : g.value || g.label,
              ),
            ]);
            const mergedGroups = Array.from(mergedGroupsSet);

            // Queue for bulk update
            console.log(
              `Queuing group merge for existing contact: ${existingContact.first_name} ${existingContact.last_name}`,
              { existingGroups, newGroups, mergedGroups },
            );
            contactsToUpdate.push({
              id: existingContact.id,
              data: {
                ...existingContact,
                groups: mergedGroups,
              },
            });
            const mergeMsg = `Line ${i + 1}: Merged ${newGroups.length} group(s) to existing contact ${existingContact.first_name} ${existingContact.last_name}`;
            console.log(mergeMsg);
            duplicates.push(mergeMsg);
            continue;
          }

          // Queue for bulk insert
          console.log(`Queuing contact for line ${i + 1}:`, contact);
          contactsToAdd.push(contact);
        }

        // Perform bulk operations after parsing all rows
        let importedContacts = [];

        if (contactsToAdd.length > 0) {
          console.log(`Bulk inserting ${contactsToAdd.length} contacts...`);
          try {
            const { data, error } = await bulkAddContacts(contactsToAdd);
            if (error) {
              errors.push(`Bulk insert failed: ${error}`);
            } else if (data) {
              importedContacts = data;
              console.log(`Successfully bulk inserted ${data.length} contacts`);
            }
          } catch (err) {
            errors.push(`Bulk insert error: ${err.message}`);
          }
        }

        if (contactsToUpdate.length > 0) {
          console.log(`Bulk updating ${contactsToUpdate.length} contacts...`);
          try {
            const { data, error } = await bulkUpdateContacts(contactsToUpdate);
            if (error) {
              errors.push(`Bulk update failed: ${error}`);
            } else {
              console.log(
                `Successfully bulk updated ${contactsToUpdate.length} contacts`,
              );
            }
          } catch (err) {
            errors.push(`Bulk update error: ${err.message}`);
          }
        }

        // Create and return summary
        const summary = {
          imported: importedContacts.length,
          merged: duplicates.length,
          errors: errors.length,
          errorDetails: errors,
          duplicateDetails: duplicates,
        };

        console.log("Import completed. Summary:", summary);

        // Refresh contacts after import
        if (importedContacts.length > 0 || duplicates.length > 0) {
          console.log("Refreshing contacts after import");
          refreshContacts();
        }

        // Reset the file input to allow reimporting
        event.target.value = null;
        resolve(summary);
      } catch (error) {
        console.error("Error during CSV import:", error);
        event.target.value = null;
        resolve({
          imported: 0,
          merged: 0,
          errors: 1,
          errorDetails: [error.message || "Unknown error"],
          duplicateDetails: [],
        });
      }
    };

    reader.onerror = () => {
      const errorMsg = "Error reading file";
      console.error(errorMsg);
      event.target.value = null;
      resolve({
        imported: 0,
        merged: 0,
        errors: 1,
        errorDetails: [errorMsg],
        duplicateDetails: [],
      });
    };

    reader.readAsText(file);
  });
};
