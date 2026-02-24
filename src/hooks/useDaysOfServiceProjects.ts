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
    community_id: string | null,
    city_id: string | null,
    daysOfServiceShortId: string | null,
    partner_stake_id: string | null,
    user: any,
  ) => {
    setLoading(true);
    try {
      const projectData: any = {
        community_id: community_id,
        city_id: city_id,
        updated_by: user?.id,
        created_by: user?.id, // Only set on creation
      };

      // Only fetch and set days_of_service_id if a shortId is provided
      if (daysOfServiceShortId) {
        const { data: dayOfService, error: dos_error } =
          await fetchDayOfServiceByShortId(daysOfServiceShortId);

        if (dos_error) throw dos_error;

        projectData.days_of_service_id = dayOfService?.id;
      }

      // Only set partner_stake_id if provided
      if (partner_stake_id) {
        projectData.partner_stake_id = partner_stake_id;
      }

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
      console.error("Project creation error:", error);
      toast.error("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedCommunityProjects = async (
    communityId: string | null,
  ) => {
    setLoading(true);
    try {
      let query = supabase
        .from("days_of_service_project_forms")
        .select("*")
        .is("days_of_service_id", null);

      // If communityId is null (dev mode), filter by null city_id
      // Otherwise, filter by the specific communityId
      if (communityId === null) {
        query = query.is("city_id", null);
      } else {
        query = query.eq("community_id", communityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        return data;
      }
    } catch (error) {
      toast.error("Failed to load unassigned projects");
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
    summaryOnly = false,
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select(
          summaryOnly
            ? "id, status, project_name, project_development_couple, address_street1, address_street2, address_city, created_at, updated_at"
            : "*",
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
    summaryOnly = false,
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select(
          summaryOnly
            ? "id, status, project_name, project_development_couple, address_street1, address_street2, address_city, created_at, updated_at"
            : "*",
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
    includeBudget: boolean = false,
  ) => {
    // this function has been moved to reportGenerators.ts
  };

  const generateStakeSummaryReport = async (
    stakeId,
    dateOfService,
    dayOfService,
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
        (stake) => stake.id === stakeId,
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
            logoHeight,
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
          yPosition,
        );
        yPosition += 5;
        doc.text(stakeContact, margin, yPosition);

        if (partnerStake.liaison_name_2) {
          yPosition += 5;
          doc.text(stakeContact2, margin, yPosition);
        }
        yPosition += 5;
        doc.setTextColor("#e30031"); //red
        doc.text(
          `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
          margin,
          yPosition,
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
          `Local Group: ${project.partner_ward || "N/A"}`,
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
              task.todos?.length > 0 ? task.todos[0].substring(0, 40) : "N/A",
            );

          tasks.forEach((task) => {
            const wrappedTask = doc.splitTextToSize(
              `• ${task}${task.length > 40 ? "..." : ""}`,
              colWidth - 15,
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
          "FD",
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
              task.todos?.length > 0 ? task.todos[0].substring(0, 40) : "",
            )
            .filter((task) => task.trim()); // Filter out empty tasks

          if (tasks.length > 0) {
            // Only proceed with rendering if we have non-empty tasks
            tasks.forEach((task) => {
              const wrappedTask = doc.splitTextToSize(
                `• ${task}${task.length > 40 ? "..." : ""}`,
                colWidth - 15,
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
          },
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
    filterType?: "cityId" | "communityId" | "daysOfServiceId",
  ) => {
    // Resolve filterType — some callers pass it as the 3rd argument (dateOfService position)
    const resolvedFilterType: "cityId" | "communityId" | "daysOfServiceId" | undefined =
      filterType ??
      (["cityId", "communityId", "daysOfServiceId"].includes(dateOfService ?? "")
        ? (dateOfService as "cityId" | "communityId" | "daysOfServiceId")
        : undefined);

    if (type !== "multiple" || !resolvedFilterType) {
      toast.error("Invalid report parameters");
      return;
    }

    setLoading(true);
    try {
      let projectsData: any[] = [];

      switch (resolvedFilterType) {
        case "cityId":
          projectsData = (await fetchProjectsByCityId(identifier)) || [];
          break;
        case "communityId":
          projectsData = (await fetchProjectsByCommunityId(identifier)) || [];
          break;
        case "daysOfServiceId":
          projectsData = (await fetchProjectsByDaysOfServiceId(identifier)) || [];
          break;
      }

      if (!projectsData.length) {
        toast.warning("No projects found to generate report");
        return;
      }

      toast.success(`${projectsData.length} project(s) found. Reports are not yet implemented for bulk generation.`);
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const generateCommunityReportCSV = async (
    community: any,
    daysOfService: any,
  ) => {
    // Helper function to get project description
    const getProjectDescription = (project: any) => {
      // Try to get from project_name first
      if (project.project_name) {
        return (
          project.project_name.substring(0, 50) +
          (project.project_name.length > 50 ? "..." : "")
        );
      }

      // If no project name, try to get from first task
      if (project.tasks?.tasks?.length > 0) {
        const firstTask = project.tasks.tasks[0];
        if (firstTask.todos?.length > 0) {
          const description = firstTask.todos[0];
          return (
            description.substring(0, 50) +
            (description.length > 50 ? "..." : "")
          );
        }
      }

      return "No description provided";
    };

    // Helper function to format boolean values
    const formatBoolean = (value: any) => {
      if (value === true) return "Yes";
      if (value === false) return "No";
      return "N/A";
    };

    // Create CSV content
    let csvContent = "";

    // Generate the report
    for (const day of daysOfService) {
      // Day header
      const dayHeader = `${day.name || "Day of Service"} - ${moment(
        day.end_date,
      ).format("ddd, MM/DD/yy")}`;
      csvContent += `"${dayHeader}"\n`;

      // UPDATED: Column headers for projects (new format)
      csvContent += `"Organization","Group","Home Owner","Address","Status","Needed # of Volunteers","Resource Couple","Project Short Description","Dumpster","Waiver","Prep Day","Actual # of Volunteers","Actual # of Hours"\n`;

      // Process each stake sequentially
      for (const stake of day.partner_stakes) {
        // Fetch projects for this stake
        const projects = (await fetchProjectsByDaysOfStakeId(
          stake.id,
        )) as any[];

        if (projects.length === 0) {
          // UPDATED: Add a row for stakes with no projects (with new column count)
          csvContent += `"${stake.name}","No projects found for this stake.","","","","","","","","","","",""\n`;
        } else {
          projects.forEach((project) => {
            // Format address
            const address = `${project.address_street1}${
              project.address_street2 ? ", " + project.address_street2 : ""
            }, ${project.address_city}, ${project.address_state}, ${
              project.address_zip_code
            }`;
            const status =
              project.status?.toUpperCase() || "In Progress".toUpperCase();

            // UPDATED: Get all the new field values
            const neededVolunteers = project.volunteers_needed || "";
            const actualVolunteers = project.actual_volunteers || "";
            const actualHours = project.actual_project_duration || "";
            const resourceCouple = project.project_development_couple || "";
            const projectDescription = project.project_id || "";
            const dumpster = formatBoolean(project.is_dumpster_needed);
            const waiver = formatBoolean(project.is_waiver_signed);
            const prepDay = formatBoolean(project.has_prep_day);

            // Escape any double quotes in text fields by doubling them
            const escapedStakeName = stake.name.replace(/"/g, '""');
            const escapedGroup = (project.partner_ward || "").replace(
              /"/g,
              '""',
            );
            const escapedOwner = (project.property_owner || "").replace(
              /"/g,
              '""',
            );
            const escapedAddress = address.replace(/"/g, '""');
            const escapedStatus = status.replace(/"/g, '""');
            const escapedResourceCouple = resourceCouple.replace(/"/g, '""');
            const escapedProjectDescription = projectDescription.replace(
              /"/g,
              '""',
            );

            // UPDATED: Add the row to CSV content with all new columns
            csvContent += `"${escapedStakeName}","${escapedGroup}","${escapedOwner}","${escapedAddress}","${escapedStatus}","${neededVolunteers}","${escapedResourceCouple}","${escapedProjectDescription}","${dumpster}","${waiver}","${prepDay}","${actualVolunteers}","${actualHours}"\n`;
          });
        }
      }

      // Add blank lines after each day
      csvContent += `\n\n`;
    }

    // Generate filename
    const fileName = `${community.city_name} - ${community.name} Days of Service Report.csv`;

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";

    // Append to document, trigger click and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return fileName;
  };

  return {
    loading,
    addProject,
    generateReports,
    generatePDFReport,
    generateStakeSummaryReport,
    generateCommunityReportCSV,
    fetchProjectsByCommunityId,
    fetchProjectsByCityId,
    fetchProjectsByDaysOfServiceId,
    fetchProjectsByDaysOfStakeId,
    fetchUnassignedCommunityProjects,
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
