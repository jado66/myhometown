import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { useDaysOfService } from "./useDaysOfService";
import jsPDF from "jspdf";
import "jspdf-autotable"; // For table formatting
import { formatSafeDate } from "@/util/dates/formatSafeDate";
import moment from "moment";

export const useDaysOfServiceProjects = () => {
  const [loading, setLoading] = useState(true);

  const { fetchDayOfServiceByShortId } = useDaysOfService();

  const addProject = async (
    newId: string,
    community_id: string,
    city_id: string,
    daysOfServiceShortId: string,
    partner_stake_id: string,
    user: any
  ) => {
    setLoading(true);
    try {
      const { data: dayOfService, error: dos_error } =
        await fetchDayOfServiceByShortId(daysOfServiceShortId);

      if (dos_error) throw dos_error;

      const daysOfServiceId = dayOfService?.id;

      const projectData = {
        community_id: community_id,
        city_id: city_id,
        days_of_service_id: daysOfServiceId,
        partner_stake_id: partner_stake_id,
        updated_by: user?.id,
        created_by: user?.id, // Only set on creation
      };

      // If a newId is provided, use it
      if (newId) {
        projectData.id = newId;
      }

      const { error } = await supabase
        .from("days_of_service_project_forms")
        .insert([projectData]);

      if (error) throw error;

      toast.success("Project created successfully");
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByCommunityId = async (communityId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select("*")
        .eq("community_id", communityId);

      if (error) throw error;

      if (data) {
        return data;
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByCityId = async (cityId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select("*")
        .eq("city_id", cityId);

      if (error) throw error;

      if (data) {
        return data;
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByDaysOfServiceId = async (
    daysOfServiceId: string,
    summaryOnly = false
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select(
          summaryOnly
            ? "id, status, project_name, project_development_couple, address_street1, address_street2, address_city, created_at, updated_at"
            : "*"
        )
        .eq("days_of_service_id", daysOfServiceId);

      if (error) throw error;

      if (data) {
        return data;
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsByDaysOfStakeId = async (
    stakeId: string,
    summaryOnly = false
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select(
          summaryOnly
            ? "id, status, project_name, project_development_couple, address_street1, address_street2, address_city, created_at, updated_at"
            : "*"
        )
        .eq("partner_stake_id", stakeId);

      if (error) throw error;

      if (data) {
        return data;
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("days_of_service_project_forms")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async (
    identifier: string,
    dateOfService: string,
    projectName: string,
    dayOfService: any,
    includeBudget: boolean = false
  ) => {
    setLoading(true);
    try {
      let fileName = `${projectName} report.pdf`;
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
      doc.text(
        `Partner Organization: ${partner_stake?.name || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Partner Group: ${project.partner_ward || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Project Name: ${project.project_name || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Volunteers Needed: ${project.volunteers_needed || "N/A"}`,
        margin,
        yPosition
      );

      const dividerLine = (yPos: number) => {
        doc.setLineWidth(0.3); // Thinner line
        doc.line(margin, yPos, pageWidth - margin, yPos);
      };

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      // PROPERTY OWNER SECTION
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PROPERTY OWNER", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Homeowner: ${project.property_owner || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Address: ${
          [
            project.address_street1,
            project.address_street2,
            project.address_city,
            project.address_state,
            project.address_zip_code,
          ]
            .filter(Boolean)
            .join(", ") || "N/A"
        }`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Phone: ${project.phone_number || "N/A"} • Email: ${
          project.email || "N/A"
        }`,
        margin,
        yPosition
      );

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      // PROJECT COORDINATION SECTION
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PROJECT COORDINATION", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Resource Couple: ${project.project_development_couple || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Phone 1: ${
          project.project_development_couple_phone1 || "N/A"
        } • Email 1: ${project.project_development_couple_email1 || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Phone 2: ${
          project.project_development_couple_phone2 || "N/A"
        } • Email 2: ${project.project_development_couple_email2 || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(`Host: ${project.host_name || "N/A"}`, margin, yPosition);
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Host Phone: ${project.host_phone || "N/A"} • Host Email: ${
          project.host_email || "N/A"
        }`,
        margin,
        yPosition
      );

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      // WARD & VOLUNTEER INFO SECTION
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("GROUP & VOLUNTEER INFO", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Partner Group: ${project.partner_ward || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Group Liaison: ${project.partner_ward_liaison || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        `Phone: ${project.partner_ward_liaison_phone1 || "N/A"} • Email: ${
          project.partner_ward_liaison_email1 || "N/A"
        }`,
        margin,
        yPosition
      );

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      // TOOLS/MATERIALS/EQUIPMENT SECTION
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TOOLS/MATERIALS/EQUIPMENT", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);
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
      doc.text("Equipment:", margin, yPosition);
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        project.equipment?.length > 0
          ? project.equipment.map((item) => `• ${item}`).join(" ")
          : "• N/A",
        margin + 3,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text("Volunteer Tools:", margin, yPosition);
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        project.volunteerTools
          ? JSON.parse(project.volunteerTools)
              .map((item) => `• ${item}`)
              .join(" ")
          : "• N/A",
        margin + 3,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text("Homeowner Materials:", margin, yPosition);
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        project.homeownerMaterials
          ? JSON.parse(project.homeownerMaterials)
              .map((item) => `• ${item}`)
              .join(" ")
          : "• N/A",
        margin + 3,
        yPosition
      );
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text("Other Materials:", margin, yPosition);
      yPosition += 4;
      yPosition = checkForNewPage(yPosition);
      doc.text(
        project.otherMaterials
          ? JSON.parse(project.otherMaterials)
              .map((item) => `• ${item}`)
              .join(" ")
          : "• N/A",
        margin + 3,
        yPosition
      );

      yPosition += 6;
      yPosition = checkForNewPage(yPosition, 12);
      dividerLine(yPosition);
      yPosition += 6;

      // CONCISE TASK LIST SECTION
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CONCISE TASK LIST", margin, yPosition);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      yPosition += 5;
      yPosition = checkForNewPage(yPosition);

      if (project.tasks?.tasks?.length > 0) {
        const sortedTasks = [...project.tasks.tasks].sort(
          (a, b) => a.priority - b.priority
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
              ? task.todos.map((todo) => `• ${todo}`).join(" ")
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

      // Only include budget section if includeBudget is true
      if (includeBudget) {
        yPosition += 6;
        yPosition = checkForNewPage(yPosition, 12);
        dividerLine(yPosition);
        yPosition += 6;

        // BUDGET SECTION
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
      setLoading(false);
    }
  };

  const generateStakeSummaryReport = async (
    stakeId,
    dateOfService,
    dayOfService
  ) => {
    setLoading(true);
    try {
      // Fetch projects if not provided
      let projectsData = await fetchProjectsByDaysOfStakeId(stakeId, false);

      if (!projectsData || projectsData.length === 0) {
        toast.warning("No projects found to generate report");
        return;
      }

      const partnerStake = dayOfService?.partner_stakes.find(
        (stake) => stake.id === stakeId
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
      const checkForNewPage = (currentY, heightNeeded = 10) => {
        if (currentY + heightNeeded > pageHeight - margin) {
          doc.addPage();
          currentPage++;
          yPosition = margin;
          addPageHeader(true);
          return yPosition;
        }
        return currentY;
      };

      const dividerLine = (yPos) => {
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

        const stakeContact = `Organization Contact: ${
          [
            partnerStake.liaison_name_1 || "",
            partnerStake.liaison_email_1 || "",
            partnerStake.liaison_phone_1 || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        const stakeContact2 = `Organization Contact 2: ${
          [
            partnerStake.liaison_name_2 || "",
            partnerStake.liaison_email_2 || "",
            partnerStake.liaison_phone_2 || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        yPosition += logoHeight + 6;
        doc.setFontSize(12);
        doc.text(
          `Partner Organization: ${partnerStake?.name || "N/A"}`,
          margin,
          yPosition
        );
        yPosition += 5;
        doc.text(stakeContact, margin, yPosition);

        if (partnerStake.liaison_name_2) {
          yPosition += 5;
          doc.text(stakeContact2, margin, yPosition);
        }
        yPosition += 5;

        doc.text(
          `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
          margin,
          yPosition
        );

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
      projectsData.sort((a, b) => {
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
        const currentY = useLeftColumn ? leftColY : rightColY;
        const colX = useLeftColumn ? margin : margin + colWidth + 5; // X position based on column

        // First, calculate the height that the content will need
        let tempY = currentY + 5; // Reduced top padding from 6 to 5

        // Project Number and Name
        const projectTitle = `${project.project_name || "Unnamed Project"}`;
        const wrappedTitle = doc.splitTextToSize(projectTitle, colWidth - 10);
        tempY += wrappedTitle.length * 5 + 1; // Reduced spacing after title from 2 to 1

        // Calculate height for details
        const details = [
          `Local Group: ${project.project_development_couple_ward || "N/A"}`,
          `Homeowner: ${project.property_owner || "N/A"}`,
          `Address: ${concatenateAddress(project)}`,
          `Phone: ${project.phone_number || "N/A"}`,
          `Host: ${project.host_name || "N/A"}${
            project.host_phone ? ` (${project.host_phone})` : ""
          }`,
          `Group: ${project.partner_ward || "N/A"}`,
        ];

        details.forEach((line) => {
          const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
          tempY += wrappedLine.length * 4;
        });

        // Calculate height for tasks
        if (project.tasks?.tasks?.length > 0) {
          tempY += 4; // "Project Description:" label

          const tasks = project.tasks.tasks
            .slice(0, 3) // Limit to 3 tasks
            .map((task) =>
              task.todos?.length > 0 ? task.todos[0].substring(0, 40) : "N/A"
            );

          tasks.forEach((task) => {
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

        const groupContact = `Group Contact: ${
          [
            project.partner_ward_liaison || "",
            project.partner_ward_liaison_phone1 || "",
            project.partner_ward_liaison_email1 || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        const projectContact = `Contact For Project: ${
          [
            project.project_development_couple || "",
            project.project_development_couple_phone1 || "",
            project.project_development_couple_email1 || "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        // Calculate height for more details

        const requirements = `${
          [
            project.volunteers_needed
              ? `Volunteers Needed: ${project.volunteers_needed}`
              : "",
            project.are_blue_stakes_needed ? "Blue Stakes Needed" : "",
            project.is_dumspter_needed
              ? project.is_second_dumpster_needed
                ? "2 Dumpsters Needed"
                : "Dumpster Needed"
              : "",
          ]
            .filter((item) => item && item !== "null")
            .join(" - ") || "N/A"
        }`;

        const moreDetails = [
          projectContact,
          `Partner Group: ${project.partner_ward || "(Not provided)"}`,
          groupContact,
          requirements,
        ];

        moreDetails.forEach((line) => {
          const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
          tempY += wrappedLine.length * 4;
        });

        // Reduced padding at bottom of card from 6 to 4
        tempY += 4;

        // Calculate the actual height needed for the card
        const estimatedCardHeight = tempY - currentY;

        // Check if adding this card to the current column would exceed page height
        const wouldExceedPage =
          currentY + estimatedCardHeight > pageHeight - margin;

        // If it would exceed, check how to handle it:
        if (wouldExceedPage) {
          if (useLeftColumn && rightColY < currentY) {
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
            // addPageHeader(true);

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
          wrappedLine.forEach((text) => {
            doc.text(text, colX + 5, contentY);
            contentY += 4;
          });
        });

        doc.text("Project Description:", colX + 5, contentY);
        contentY += 4;

        if (project.tasks?.tasks?.length > 0) {
          // Map and display tasks if they exist
          const tasks = project.tasks.tasks
            .map((task) =>
              task.todos?.length > 0 ? task.todos[0].substring(0, 40) : ""
            )
            .filter((task) => task.trim()); // Filter out empty tasks

          if (tasks.length > 0) {
            // Only proceed with rendering if we have non-empty tasks
            tasks.forEach((task) => {
              const wrappedTask = doc.splitTextToSize(
                `• ${task}${task.length > 40 ? "..." : ""}`,
                colWidth - 15
              );
              wrappedTask.slice(0, 1).forEach((text) => {
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

        moreDetails.forEach((line) => {
          const wrappedLine = doc.splitTextToSize(line, colWidth - 10);
          wrappedLine.forEach((text) => {
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
      setLoading(false);
    }
  };

  const generateReports = async (
    type: "single" | "multiple",
    identifier: string,
    dateOfService?: string,
    filterType?: "cityId" | "communityId" | "daysOfServiceId"
  ) => {
    setLoading(true);
    try {
      let projectsData: any[] = [];
      let fileName = "";

      if (type === "single") {
        const { data, error } = await supabase
          .from("days_of_service_project_forms")
          .select("*")
          .eq("id", identifier)
          .single();

        if (error) throw error;
        projectsData = [data];
        fileName = `project_${identifier}_report.pdf`;
      } else if (type === "multiple" && filterType) {
        switch (filterType) {
          case "cityId":
            projectsData = (await fetchProjectsByCityId(identifier)) || [];
            fileName = `city_${identifier}_projects_report.pdf`;
            break;
          case "communityId":
            projectsData = (await fetchProjectsByCommunityId(identifier)) || [];
            fileName = `community_${identifier}_projects_report.pdf`;
            break;
          case "daysOfServiceId":
            projectsData =
              (await fetchProjectsByDaysOfServiceId(identifier)) || [];
            fileName = `days_of_service_${identifier}_projects_report.pdf`;
            break;
          default:
            throw new Error("Invalid filter type");
        }
      } else {
        throw new Error("Invalid report parameters");
      }

      if (!projectsData.length) {
        toast.warning("No projects found to generate report");
        return;
      }

      const doc = new jsPDF();

      // I DON"T WORK
      // Save the PDF
      doc.save(fileName);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addProject,
    generateReports,
    generatePDFReport,
    generateStakeSummaryReport,
    fetchProjectsByCommunityId,
    fetchProjectsByCityId,
    fetchProjectsByDaysOfServiceId,
    fetchProjectsByDaysOfStakeId,
    deleteProject,
  };
};

// Helper function to convert data to C

const concatenateAddress = (project: any) => {
  return [
    project.address_street1,
    project.address_street2,
    project.address_city,
    project.address_state,
    project.address_zip_code,
  ]
    .filter(Boolean)
    .join(", ");
};
