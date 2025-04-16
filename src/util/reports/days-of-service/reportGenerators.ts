import { supabase } from "@/util/supabase";
import { jsPDF } from "jspdf";
import moment from "moment";
import { toast } from "react-toastify";

// Helper function to format date safely
const formatSafeDate = (date: string | Date) => {
  try {
    return moment(date).format("MMMM D, YYYY");
  } catch (error) {
    return "N/A";
  }
};

// Helper function to concatenate address parts
const concatenateAddress = (project: any) => {
  return (
    [
      project.address_street1,
      project.address_street2,
      project.address_city,
      project.address_state,
      project.address_zip_code,
    ]
      .filter(Boolean)
      .join(", ") || "N/A"
  );
};

// Helper function to anonymize text based on settings
const anonymizeText = (
  text: string | null | undefined,
  isPII: boolean,
  settings?: any
): string => {
  if (!text) return "N/A";
  if (!settings || !settings.anonymizePII || !isPII) return text;

  // Different anonymization strategies based on data type
  if (text.includes("@")) {
    // Email anonymization
    return "***@***.***";
  } else if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
    // Phone number anonymization
    return "***-***-****";
  } else {
    // General text anonymization
    return "*** REDACTED ***";
  }
};

// Helper to check if a field should be included
const shouldIncludeField = (fieldId: string, settings?: any): boolean => {
  if (!settings) return true;
  return settings.includedFields[fieldId] === true;
};

export const generatePDFReport = async (
  identifier: string,
  dateOfService: string,
  projectName: string,
  dayOfService: any,
  includeBudget = false,
  settings?: any,
  setLoading?: (loading: boolean) => void
) => {
  if (setLoading) setLoading(true);
  try {
    const fileName = `${projectName} report.pdf`;
    const { data, error } = await supabase
      .from("days_of_service_project_forms")
      .select("*")
      .eq("id", identifier)
      .single();

    if (error) throw error;
    if (!data) {
      toast.warning("No project found to generate report");
      return;
    }

    const project = data;
    const partner_stake = dayOfService?.partner_stakes.find(
      (stake: any) => stake.id === project.partner_stake_id
    );

    const doc = new jsPDF();
    const logoPath = "/svgs/Primary_Logo_Black_Text.png";
    const logoWidth = 40; // Reduced width
    const logoHeight = 6.15; // Adjusted proportionally
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 8; // Reduced margin

    const checkForNewPage = (currentY: number, heightNeeded = 8) => {
      if (currentY + heightNeeded > pageHeight - margin) {
        doc.addPage();
        return margin;
      }
      return currentY;
    };

    // Load logo
    let imgData: string | null = null;
    try {
      const response = await fetch(logoPath);
      const blob = await response.blob();
      imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (imgError) {
      console.error("Failed to load logo:", imgError);
    }

    let yPosition = margin;

    // Title and Logo
    doc.setFontSize(16); // Reduced font size
    doc.setFont("helvetica", "bold");
    doc.text("Days Of Service Project Report", margin, yPosition + 4);
    if (imgData) {
      doc.addImage(
        imgData,
        "PNG",
        pageWidth - logoWidth - margin,
        yPosition,
        logoWidth,
        logoHeight
      );
    } else {
      doc.setFontSize(8);
      doc.text("MHT Dashboard", pageWidth - margin, yPosition + 2, {
        align: "right",
      });
    }
    yPosition += logoHeight + 6; // Reduced spacing

    // Header
    doc.setFontSize(14);
    doc.text(`Date of Service: ${dateOfService || "N/A"}`, margin, yPosition);
    doc.setFontSize(10); // Reduced font size
    yPosition += 5; // Reduced spacing
    yPosition = checkForNewPage(yPosition);

    if (shouldIncludeField("partner_stake_id", settings)) {
      doc.text(
        `Partner Organization: ${partner_stake?.name || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
    }

    if (shouldIncludeField("partner_ward", settings)) {
      doc.text(
        `Partner Group: ${project.partner_ward || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
    }

    if (shouldIncludeField("project_name", settings)) {
      doc.text(
        `Project Name: ${project.project_name || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
    }

    if (shouldIncludeField("volunteers_needed", settings)) {
      doc.text(
        `Volunteers Needed: ${project.volunteers_needed || "N/A"}`,
        margin,
        yPosition
      );
    }

    const dividerLine = (yPos: number) => {
      doc.setLineWidth(0.3); // Thinner line
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    yPosition += 6;
    yPosition = checkForNewPage(yPosition, 12);
    dividerLine(yPosition);
    yPosition += 6;

    // PROPERTY OWNER SECTION
    // Only include this section if at least one property owner field is included
    const includePropertyOwnerSection = Object.keys(project)
      .filter(
        (key) =>
          key.startsWith("property_owner") ||
          key.startsWith("address_") ||
          key === "phone_number" ||
          key === "email"
      )
      .some((key) => shouldIncludeField(key, settings));

    if (includePropertyOwnerSection) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PROPERTY OWNER", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      if (shouldIncludeField("property_owner", settings)) {
        doc.text(
          `Homeowner: ${anonymizeText(project.property_owner, true, settings)}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("address_street1", settings)) {
        // Handle address based on anonymization settings
        let addressText;
        if (settings?.anonymizePII) {
          // If anonymizing, only show city and state
          addressText = `Address: ${project.address_city || ""}, ${
            project.address_state || ""
          }`;
        } else {
          addressText = `Address: ${concatenateAddress(project)}`;
        }
        doc.text(addressText, margin, yPosition);
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (
        shouldIncludeField("phone_number", settings) ||
        shouldIncludeField("email", settings)
      ) {
        doc.text(
          `Phone: ${anonymizeText(
            project.phone_number,
            true,
            settings
          )} • Email: ${anonymizeText(project.email, true, settings)}`,
          margin,
          yPosition
        );
      }

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;
    }

    // PROJECT COORDINATION SECTION
    // Only include this section if at least one project coordination field is included
    const includeProjectCoordinationSection = Object.keys(project)
      .filter(
        (key) =>
          key.startsWith("project_development_couple") ||
          key.startsWith("host_")
      )
      .some((key) => shouldIncludeField(key, settings));

    if (includeProjectCoordinationSection) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PROJECT COORDINATION", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      if (shouldIncludeField("project_development_couple", settings)) {
        doc.text(
          `Resource Couple: ${anonymizeText(
            project.project_development_couple,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (
        shouldIncludeField("project_development_couple_phone1", settings) ||
        shouldIncludeField("project_development_couple_email1", settings)
      ) {
        doc.text(
          `Phone 1: ${anonymizeText(
            project.project_development_couple_phone1,
            true,
            settings
          )} • Email 1: ${anonymizeText(
            project.project_development_couple_email1,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (
        shouldIncludeField("project_development_couple_phone2", settings) ||
        shouldIncludeField("project_development_couple_email2", settings)
      ) {
        doc.text(
          `Phone 2: ${anonymizeText(
            project.project_development_couple_phone2,
            true,
            settings
          )} • Email 2: ${anonymizeText(
            project.project_development_couple_email2,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("host_name", settings)) {
        doc.text(
          `Host: ${anonymizeText(project.host_name, true, settings)}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (
        shouldIncludeField("host_phone", settings) ||
        shouldIncludeField("host_email", settings)
      ) {
        doc.text(
          `Host Phone: ${anonymizeText(
            project.host_phone,
            true,
            settings
          )} • Host Email: ${anonymizeText(
            project.host_email,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
      }

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;
    }

    // GROUP & VOLUNTEER INFO SECTION
    // Only include this section if at least one group info field is included
    const includeGroupInfoSection = Object.keys(project)
      .filter(
        (key) =>
          key.startsWith("partner_ward") ||
          key === "volunteers_needed" ||
          key === "actual_volunteers"
      )
      .some((key) => shouldIncludeField(key, settings));

    if (includeGroupInfoSection) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("GROUP & VOLUNTEER INFO", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      // Check-in location is always shown as it's not PII
      doc.setTextColor("#e30031"); //red
      doc.text(
        `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
        margin,
        yPosition
      );
      doc.setTextColor("#000000"); // Reset to black
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);

      if (shouldIncludeField("partner_ward", settings)) {
        doc.text(
          `Partner Group: ${project.partner_ward || "N/A"}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("partner_ward_liaison", settings)) {
        doc.text(
          `Group Liaison: ${anonymizeText(
            project.partner_ward_liaison,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (
        shouldIncludeField("partner_ward_liaison_phone1", settings) ||
        shouldIncludeField("partner_ward_liaison_email1", settings)
      ) {
        doc.text(
          `Phone: ${anonymizeText(
            project.partner_ward_liaison_phone1,
            true,
            settings
          )} • Email: ${anonymizeText(
            project.partner_ward_liaison_email1,
            true,
            settings
          )}`,
          margin,
          yPosition
        );
      }

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;
    }

    // TOOLS/MATERIALS/EQUIPMENT SECTION
    // Only include this section if at least one materials field is included
    const includeMaterialsSection = [
      "equipment",
      "volunteerTools",
      "homeownerMaterials",
      "otherMaterials",
      "is_dumpster_needed",
      "is_second_dumpster_needed",
    ].some((key) => shouldIncludeField(key, settings));

    if (includeMaterialsSection) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TOOLS/MATERIALS/EQUIPMENT", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      if (
        shouldIncludeField("is_dumpster_needed", settings) ||
        shouldIncludeField("materials_on_site", settings) ||
        shouldIncludeField("materials_procured", settings) ||
        shouldIncludeField("tools_arranged", settings)
      ) {
        doc.text(
          `Dumpster: [${
            project.dumpster_requested ? "X" : " "
          }] Requested • Materials on Site: [${
            project.materials_on_site ? "X" : " "
          }] Yes • Materials Procured: [${
            project.materials_procured ? "X" : " "
          }] Yes • Tools Arranged: [${project.tools_arranged ? "X" : " "}] Yes`,
          margin,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("equipment", settings)) {
        doc.text("Equipment:", margin, yPosition);
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
        doc.text(
          project.equipment?.length > 0
            ? project.equipment.map((item: string) => `• ${item}`).join(" ")
            : "• N/A",
          margin + 3,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("volunteerTools", settings)) {
        doc.text("Volunteer Tools:", margin, yPosition);
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
        doc.text(
          project.volunteerTools
            ? JSON.parse(project.volunteerTools)
                .map((item: string) => `• ${item}`)
                .join(" ")
            : "• N/A",
          margin + 3,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("homeownerMaterials", settings)) {
        doc.text("Homeowner Materials:", margin, yPosition);
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
        doc.text(
          project.homeownerMaterials
            ? JSON.parse(project.homeownerMaterials)
                .map((item: string) => `• ${item}`)
                .join(" ")
            : "• N/A",
          margin + 3,
          yPosition
        );
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
      }

      if (shouldIncludeField("otherMaterials", settings)) {
        doc.text("Other Materials:", margin, yPosition);
        yPosition += 4;
        yPosition = checkForNewPage(yPosition);
        doc.text(
          project.otherMaterials
            ? JSON.parse(project.otherMaterials)
                .map((item: string) => `• ${item}`)
                .join(" ")
            : "• N/A",
          margin + 3,
          yPosition
        );
      }

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;
    }

    // CONCISE TASK LIST SECTION
    if (shouldIncludeField("tasks", settings)) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONCISE TASK LIST", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      if (project.tasks?.tasks?.length > 0) {
        const sortedTasks = [...project.tasks.tasks].sort(
          (a: any, b: any) => a.priority - b.priority
        );
        for (let taskIndex = 0; taskIndex < sortedTasks.length; taskIndex++) {
          const task = sortedTasks[taskIndex];
          yPosition = checkForNewPage(yPosition, 8);
          doc.setFont("helvetica", "bold");
          doc.text(`Task ${taskIndex + 1}`, margin, yPosition);
          yPosition += 4;
          doc.setFont("helvetica", "normal");
          doc.text(
            task.todos?.length > 0
              ? task.todos.map((todo: string) => `• ${todo}`).join(" ")
              : "• No specific todos",
            margin + 3,
            yPosition
          );
          yPosition += 4;

          if (task.photos?.length > 0) {
            for (const photoUrl of task.photos) {
              yPosition = checkForNewPage(yPosition, 30);
              try {
                const response = await fetch(photoUrl);
                const blob = await response.blob();
                const imgData = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                doc.addImage(imgData, "JPEG", margin, yPosition, 50, 25); // Smaller images
                yPosition += 28;
              } catch (imgError) {
                doc.text("[Image could not be loaded]", margin, yPosition);
                yPosition += 4;
              }
            }
          }
          yPosition += 2; // Reduced spacing between tasks
        }
      } else {
        doc.text("• No tasks specified", margin, yPosition);
        yPosition += 4;
      }
    }

    // BUDGET SECTION
    // Only include budget section if includeBudget is true AND budget fields are included in settings
    if (
      includeBudget &&
      (shouldIncludeField("budget_estimates", settings) ||
        shouldIncludeField("homeowner_ability_estimates", settings))
    ) {
      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BUDGET & HOMEOWNER CONTRIBUTION", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Total Budget Estimate: $${
          project.budget_estimates || "N/A"
        } • Property Owner's Ability Estimates: $${
          project.homeowner_ability_estimates || "N/A"
        }`,
        margin,
        yPosition
      );
    }

    doc.save(fileName);
    toast.success("Report generated successfully");
  } catch (error) {
    console.error("Failed to generate report:", error);
    toast.error("Failed to generate report");
  } finally {
    if (setLoading) setLoading(false);
  }
};

const fetchProjectsByDaysOfStakeId = async (
  stakeId: string,
  includeBudget = false
) => {
  try {
    const { data, error } = await supabase
      .from("days_of_service_project_forms")
      .select("*")
      .eq("partner_stake_id", stakeId);

    if (error) {
      console.error("Error fetching projects:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
};

export const generateStakeSummaryReport = async (
  stakeId: string,
  dateOfService: string,
  dayOfService: any,
  settings?: ReportSettings,
  setLoading?: (loading: boolean) => void
) => {
  if (setLoading) setLoading(true);
  try {
    // Fetch projects if not provided
    const projectsData = await fetchProjectsByDaysOfStakeId(stakeId, false);

    if (!projectsData || projectsData.length === 0) {
      toast.warning("No projects found to generate report");
      return;
    }

    const partnerStake = dayOfService?.partner_stakes.find(
      (stake: any) => stake.id === stakeId
    );
    const formattedDate = formatSafeDate(dateOfService);

    // Initialize PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 2;
    const maxWidth = pageWidth - 2 * margin;

    // Load logo
    const logoPath = "/svgs/Primary_Logo_Black_Text.png";
    const logoWidth = 40;
    const logoHeight = 6.15;
    let imgData = null;
    try {
      const response = await fetch(logoPath);
      const blob = await response.blob();
      imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (imgError) {
      console.error("Failed to load logo:", imgError);
    }

    let yPosition = margin;
    let currentPage = 1;

    // Helper functions
    const checkForNewPage = (currentY: number, heightNeeded = 10) => {
      if (currentY + heightNeeded > pageHeight - margin) {
        doc.addPage();
        currentPage++;
        yPosition = margin;
        addPageHeader(true);
        return yPosition;
      }
      return currentY;
    };

    const dividerLine = (yPos: number) => {
      doc.setLineWidth(0.3);
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    const addPageHeader = (isNewPage = false) => {
      if (!isNewPage) yPosition = margin;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Organization Projects Summary", margin, yPosition + 4);

      if (imgData) {
        doc.addImage(
          imgData,
          "PNG",
          pageWidth - logoWidth - margin,
          yPosition,
          logoWidth,
          logoHeight
        );
      } else {
        doc.setFontSize(8);
        doc.text("MHT Dashboard", pageWidth - margin, yPosition + 2, {
          align: "right",
        });
      }

      // Only include contact information if not anonymized or if explicitly included
      let stakeContact = "Organization Contact: N/A";
      let stakeContact2 = "Organization Contact 2: N/A";

      if (
        shouldIncludeField("partner_stake_liaison", settings) &&
        shouldIncludeField("partner_stake_liaison_phone", settings) &&
        shouldIncludeField("partner_stake_liaison_email", settings)
      ) {
        stakeContact = `Organization Contact: ${
          [
            anonymizeText(partnerStake?.liaison_name_1, true, settings) || "",
            anonymizeText(partnerStake?.liaison_email_1, true, settings) || "",
            anonymizeText(partnerStake?.liaison_phone_1, true, settings) || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        if (partnerStake?.liaison_name_2) {
          stakeContact2 = `Organization Contact 2: ${
            [
              anonymizeText(partnerStake?.liaison_name_2, true, settings) || "",
              anonymizeText(partnerStake?.liaison_email_2, true, settings) ||
                "",
              anonymizeText(partnerStake?.liaison_phone_2, true, settings) ||
                "",
            ]
              .filter((item) => item && item !== "null")
              .join(" - ") || "N/A"
          }`;
        }
      }

      yPosition += logoHeight + 6;
      doc.setFontSize(12);

      if (shouldIncludeField("partner_stake_id", settings)) {
        doc.text(
          `Partner Organization: ${partnerStake?.name || "N/A"}`,
          margin,
          yPosition
        );
        yPosition += 5;
      }

      doc.text(stakeContact, margin, yPosition);

      if (
        partnerStake?.liaison_name_2 &&
        shouldIncludeField("partner_stake_liaison", settings)
      ) {
        yPosition += 5;
        doc.text(stakeContact2, margin, yPosition);
      }

      yPosition += 5;
      doc.setTextColor("#e30031"); //red
      doc.text(
        `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
        margin,
        yPosition
      );
      doc.setTextColor("#000000"); //black
      yPosition += 5;
      doc.text(`Date: ${formattedDate || "N/A"}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Total Projects: ${projectsData.length}`, margin, yPosition);
      yPosition += 6;
      dividerLine(yPosition);
      yPosition += 6;
    };

    // Add initial header
    addPageHeader();

    // Sort projects alphabetically
    projectsData.sort((a: any, b: any) => {
      const dateA = moment(a.created_at);
      const dateB = moment(b.created_at);
      return dateB.isValid() && dateA.isValid() ? dateB.diff(dateA) : 0; // Default to no change if dates are invalid
    });

    // Project summaries with additional details in 2-column layout
    const colWidth = (maxWidth - 5) / 2; // Width of each column, with 5pt gap between columns
    let leftColY = yPosition; // Track Y position for left column
    let rightColY = yPosition; // Track Y position for right column
    let currentColumn = "left"; // Start with left column

    // Reduced space between cards
    const spaceBetweenCards = 3;

    // Process the projects in order, but allow skipping and revisiting
    let projectIndex = 0;
    let projectsPerPage = 0; // Track projects on the current page

    while (projectIndex < projectsData.length) {
      const project = projectsData[projectIndex];

      // Determine which column to use and its current Y position
      const useLeftColumn = currentColumn === "left";
      const colX = useLeftColumn ? margin : margin + colWidth + 5; // X position based on column

      // First, calculate the height that the content will need
      let tempY = yPosition + 5; // Reduced top padding from 6 to 5

      // Project Number and Name
      const projectTitle = shouldIncludeField("project_name", settings)
        ? `${project.project_name || "Unnamed Project"}`
        : "Project";

      const wrappedTitle = doc.splitTextToSize(projectTitle, colWidth - 10);
      tempY += wrappedTitle.length * 5 + 1; // Reduced spacing after title from 2 to 1

      // Calculate height for details
      const details = [];

      if (shouldIncludeField("partner_ward", settings)) {
        details.push(`Local Group: ${project.partner_ward || "N/A"}`);
      }

      if (shouldIncludeField("property_owner", settings)) {
        details.push(
          `Homeowner: ${anonymizeText(project.property_owner, true, settings)}`
        );
      }

      if (shouldIncludeField("address_street1", settings)) {
        // Handle address based on anonymization settings
        if (settings?.anonymizePII) {
          details.push(
            `Address: ${project.address_city || ""}, ${
              project.address_state || ""
            }`
          );
        } else {
          details.push(`Address: ${concatenateAddress(project)}`);
        }
      }

      if (shouldIncludeField("phone_number", settings)) {
        details.push(
          `Phone: ${anonymizeText(project.phone_number, true, settings)}`
        );
      }

      if (
        shouldIncludeField("host_name", settings) &&
        shouldIncludeField("host_phone", settings)
      ) {
        details.push(
          `Host: ${anonymizeText(project.host_name, true, settings)}${
            project.host_phone
              ? ` (${anonymizeText(project.host_phone, true, settings)})`
              : ""
          }`
        );
      }

      if (shouldIncludeField("partner_ward", settings)) {
        details.push(`Group: ${project.partner_ward || "N/A"}`);
      }

      details.forEach((line) => {
        const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
        tempY += wrappedLine.length * 4;
      });

      // Calculate height for tasks
      if (
        shouldIncludeField("tasks", settings) &&
        project.tasks?.tasks?.length > 0
      ) {
        tempY += 4; // "Project Description:" label

        const tasks = project.tasks.tasks
          .slice(0, 3) // Limit to 3 tasks
          .map((task: any) =>
            task.todos?.length > 0 ? task.todos[0].substring(0, 40) : "N/A"
          );

        tasks.forEach((task: string) => {
          const wrappedTask = doc.splitTextToSize(
            `• ${task}${task.length > 40 ? "..." : ""}`,
            colWidth - 15
          );
          tempY += wrappedTask.slice(0, 1).length * 4;
        });

        if (project.tasks.tasks.length > 3) {
          tempY += 4; // "+X more" text
        }
      }

      // Only include contact information if not anonymized or if explicitly included
      let groupContact = "Group Contact: N/A";
      let projectContact = "Contact For Project: N/A";

      if (
        shouldIncludeField("partner_ward_liaison", settings) &&
        shouldIncludeField("partner_ward_liaison_phone1", settings) &&
        shouldIncludeField("partner_ward_liaison_email1", settings)
      ) {
        groupContact = `Group Contact: ${
          [
            anonymizeText(project.partner_ward_liaison, true, settings) || "",
            anonymizeText(
              project.partner_ward_liaison_phone1,
              true,
              settings
            ) || "",
            anonymizeText(
              project.partner_ward_liaison_email1,
              true,
              settings
            ) || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;
      }

      if (
        shouldIncludeField("project_development_couple", settings) &&
        shouldIncludeField("project_development_couple_phone1", settings) &&
        shouldIncludeField("project_development_couple_email1", settings)
      ) {
        projectContact = `Contact For Project: ${
          [
            anonymizeText(project.project_development_couple, true, settings) ||
              "",
            anonymizeText(
              project.project_development_couple_phone1,
              true,
              settings
            ) || "",
            anonymizeText(
              project.project_development_couple_email1,
              true,
              settings
            ) || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;
      }

      // Calculate height for more details
      let requirements = "N/A";

      if (
        shouldIncludeField("volunteers_needed", settings) ||
        shouldIncludeField("are_blue_stakes_needed", settings) ||
        shouldIncludeField("is_dumpster_needed", settings)
      ) {
        requirements = `${
          [
            project.volunteers_needed &&
            shouldIncludeField("volunteers_needed", settings)
              ? `Volunteers Needed: ${project.volunteers_needed}`
              : "",
            project.are_blue_stakes_needed &&
            shouldIncludeField("are_blue_stakes_needed", settings)
              ? "Blue Stakes Needed"
              : "",
            project.is_dumpster_needed &&
            shouldIncludeField("is_dumpster_needed", settings)
              ? project.is_second_dumpster_needed &&
                shouldIncludeField("is_second_dumpster_needed", settings)
                ? "2 Dumpsters Needed"
                : "Dumpster Needed"
              : "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;
      }

      const moreDetails = [];

      if (shouldIncludeField("project_development_couple", settings)) {
        moreDetails.push(projectContact);
      }

      if (shouldIncludeField("partner_ward", settings)) {
        moreDetails.push(
          `Partner Group: ${project.partner_ward || "(Not provided)"}`
        );
      }

      if (shouldIncludeField("partner_ward_liaison", settings)) {
        moreDetails.push(groupContact);
      }

      moreDetails.push(requirements);

      moreDetails.forEach((line) => {
        const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
        tempY += wrappedLine.length * 4;
      });

      // Reduced padding at bottom of card from 6 to 4
      tempY += 4;

      // Calculate the actual height needed for the card
      const estimatedCardHeight = tempY - yPosition;

      // Check if adding this card to the current column would exceed page height
      const wouldExceedPage =
        yPosition + estimatedCardHeight > pageHeight - margin;

      // If it would exceed, check how to handle it:
      if (wouldExceedPage) {
        if (useLeftColumn && rightColY < yPosition) {
          // If left column reaches bottom but right column has space, switch to right
          currentColumn = "right";
          // Don't increment projectIndex, we'll try this project again in the right column
          continue;
        } else {
          // Both columns are at bottom or we're already in right column
          doc.addPage();
          currentPage++;

          // Reset for new page but preserve column alternation
          leftColY = margin;
          rightColY = margin;
          projectsPerPage = 0; // Reset count for new page

          // Important: when starting a new page, we should KEEP the current column
          // so the alternating pattern continues across pages
          // Don't increment projectIndex, we'll try this project again on the new page

          // Add header to the new page
          // addPageHeader(true)

          continue;
        }
      }

      // Now we know we can fit the card, determine the column and position
      const cardStartY = useLeftColumn ? leftColY : rightColY;

      // Draw the card background FIRST
      const isCompleted = project.status === "completed";

      const borderColor = isCompleted ? [49, 141, 67] : [245, 245, 245];

      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(
        colX,
        cardStartY,
        colWidth,
        estimatedCardHeight,
        2, // Reduced corner radius from 3 to 2
        2, // Reduced corner radius from 3 to 2
        "FD"
      );

      // Now render all the content on top of the background
      let contentY = cardStartY + 5; // Reduced top padding from 6 to 5

      // Project Number and Name
      doc.setFontSize(11); // Slightly smaller font for narrower columns
      doc.setFont("helvetica", "bold");
      doc.text(wrappedTitle, colX + 5, contentY);
      contentY += wrappedTitle.length * 5 + 1; // Reduced spacing after title from 2 to 1

      // Details with updated schema keys
      doc.setFontSize(8); // Slightly smaller font for narrower columns
      doc.setFont("helvetica", "normal");

      details.forEach((line) => {
        const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
        wrappedLine.forEach((text: string) => {
          doc.text(text, colX + 5, contentY);
          contentY += 4;
        });
      });

      if (shouldIncludeField("tasks", settings)) {
        doc.text("Project Description:", colX + 5, contentY);
        contentY += 4;

        if (project.tasks?.tasks?.length > 0) {
          // Map and display tasks if they exist
          const tasks = project.tasks.tasks
            .map((task: any) =>
              task.todos?.length > 0 ? task.todos[0].substring(0, 40) : ""
            )
            .filter((task: string) => task.trim()); // Filter out empty tasks

          if (tasks.length > 0) {
            // Only proceed with rendering if we have non-empty tasks
            tasks.forEach((task: string) => {
              const wrappedTask = doc.splitTextToSize(
                `• ${task}${task.length > 40 ? "..." : ""}`,
                colWidth - 15
              );
              wrappedTask.slice(0, 1).forEach((text: string) => {
                doc.text(text, colX + 10, contentY);
                contentY += 4;
              });
            });
          } else {
            // No valid tasks found even though tasks array exists
            doc.text("• N/A", colX + 10, contentY);
            contentY += 4;
          }
        } else {
          // No tasks array at all
          doc.text("• N/A", colX + 10, contentY);
          contentY += 4;
        }
      }

      moreDetails.forEach((line) => {
        const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
        wrappedLine.forEach((text: string) => {
          doc.text(text, colX + 5, contentY);
          contentY += 4;
        });
      });

      // Update the Y position for the current column
      // Reduced space between cards
      if (useLeftColumn) {
        leftColY = cardStartY + estimatedCardHeight + spaceBetweenCards;
        currentColumn = "right"; // Switch to right column for next card
      } else {
        rightColY = cardStartY + estimatedCardHeight + spaceBetweenCards;
        currentColumn = "left"; // Switch to left column for next card
      }

      // Force column alignment after EACH pair of cards (two columns)
      if (projectsPerPage % 2 === 1) {
        // After processing both columns
        const maxY = Math.max(leftColY, rightColY);
        leftColY = maxY;
        rightColY = maxY;
      }

      // Move to the next project
      projectIndex++;
      projectsPerPage++;
    }

    // Add page numbers
    const totalPages = currentPage;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 5,
        {
          align: "right",
        }
      );
    }

    // Save PDF
    const fileName = `${
      partnerStake?.name || "Stake"
    }_Summary_${formattedDate}.pdf`;
    doc.save(fileName);
    toast.success("Stake summary report generated successfully");
  } catch (error) {
    console.error("Failed to generate stake summary report:", error);
    toast.error("Failed to generate stake summary");
  } finally {
    if (setLoading) setLoading(false);
  }
};
