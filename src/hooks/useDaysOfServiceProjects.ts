import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { useDaysOfService } from "./useDaysOfService";
import jsPDF from "jspdf";
import "jspdf-autotable"; // For table formatting

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
    dayOfService: any
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
      const logoPath = "/svgs/Primary_Logo_Black_Text.png"; // Path relative to /public folder in Next.js
      const logoWidth = 50; // Width in mm
      const logoHeight = 7.69; // Height in mm
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 10; // Margin in mm

      // Function to check if we need a new page
      const checkForNewPage = (currentY, heightNeeded = 10) => {
        if (currentY + heightNeeded > pageHeight - margin) {
          doc.addPage();
          return margin; // Reset Y position to top of new page with margin
        }
        return currentY;
      };

      const renderCheckbox = (isChecked: boolean, x: number, y: number) => {
        // Draw the checkbox
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(x, y - 3, 4, 4, "S");

        // Draw the checkmark if checked
        if (isChecked) {
          doc.setLineWidth(0.7);
          doc.line(x + 0.7, y - 1, x + 1.5, y - 0.2);
          doc.line(x + 1.5, y - 0.2, x + 3.3, y - 2.3);
        }
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

      // Add title at the top left
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Days Of Service Project Summary", margin, yPosition + 5);

      // Add Logo at the far right
      if (imgData) {
        const logoX = pageWidth - logoWidth - margin; // 10mm margin from right edge
        doc.addImage(imgData, "PNG", logoX, yPosition, logoWidth, logoHeight);
      } else {
        // Fallback to text if logo fails
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("MHT Dashboard", pageWidth - margin, yPosition + 3, {
          align: "right",
        });
      }

      doc.setFont("helvetica", "normal");
      yPosition += logoHeight + 10;

      // Header
      doc.setFontSize(16);
      doc.text(`Date of Service: ${dateOfService || "N/A"}`, margin, yPosition);
      doc.setFontSize(12);

      yPosition += 8;
      yPosition = checkForNewPage(yPosition);

      doc.text(`Partner Stake: ${partner_stake.name}`, margin, yPosition);
      yPosition += 8;
      yPosition = checkForNewPage(yPosition);

      doc.text(`Partner Ward: ${project.partner_ward}`, margin, yPosition);
      yPosition += 8;
      yPosition = checkForNewPage(yPosition);

      doc.text(`Project Name: ${project.project_name}`, margin, yPosition);
      yPosition += 8;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Volunteers Needed: ${project.volunteers_needed || "N/A"}`,
        margin,
        yPosition
      );

      const dividerLine = (yPos: number) => {
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
      };

      yPosition += 10;
      yPosition = checkForNewPage(yPosition, 20); // Need space for divider and section header

      dividerLine(yPosition);
      yPosition += 10;

      // PROPERTY OWNER SECTION
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PROPERTY OWNER", margin, yPosition);
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Homeowner: ${project.property_owner || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
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
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Phone: ${project.phone_number || "N/A"}    Email: ${
          project.email || "N/A"
        }`,
        margin,
        yPosition
      );

      yPosition += 10;
      yPosition = checkForNewPage(yPosition, 20); // Space for divider and next section header

      dividerLine(yPosition);
      yPosition += 10;

      // PROJECT COORDINATION SECTION
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PROJECT COORDINATION", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      doc.text(
        `Resource Couple: ${project.project_development_couple || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Phone 1: ${
          project.project_development_couple_phone1 || "N/A"
        }    Email 1: ${project.project_development_couple_email1 || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Phone 2: ${
          project.project_development_couple_phone2 || "N/A"
        }    Email 2: ${project.project_development_couple_email2 || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(`Host: ${project.host_name || "N/A"}`, margin, yPosition);
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Host Phone: ${project.host_phone || "N/A"}    Host Email: ${
          project.host_email || "N/A"
        }`,
        margin,
        yPosition
      );
      yPosition += 10;
      yPosition = checkForNewPage(yPosition, 20); // Space for divider and next section header

      dividerLine(yPosition);
      yPosition += 10;

      // WARD & VOLUNTEER INFO SECTION
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("WARD & VOLUNTEER INFO", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      doc.text(
        `Check-in Location: ${dayOfService?.check_in_location || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Partner Ward: ${project.partner_ward || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Ward Liaison: ${project.partner_ward_liaison || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Phone: ${project.partner_ward_liaison_phone1 || "N/A"}    Email: ${
          project.partner_ward_liaison_email1 || "N/A"
        }`,
        margin,
        yPosition
      );

      yPosition += 10;
      yPosition = checkForNewPage(yPosition, 20); // Space for divider and next section header

      dividerLine(yPosition);
      yPosition += 10;

      // TOOLS/MATERIALS/EQUIPMENT SECTION
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TOOLS/MATERIALS/EQUIPMENT", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      doc.text(
        `Dumpster: [${project.dumpster_requested ? "X" : " "}] Requested`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Materials on Site: [${project.materials_on_site ? "X" : " "}] Yes`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Materials Procured: [${project.materials_procured ? "X" : " "}] Yes`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Tools Arranged: [${project.tools_arranged ? "X" : " "}] Yes`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(`Equipment:`, margin, yPosition);
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      const equipmentList = project.equipment || [];
      if (equipmentList && equipmentList.length > 0) {
        equipmentList.forEach((material) => {
          yPosition = checkForNewPage(yPosition, 6);
          doc.text(`• ${material}`, margin + 5, yPosition);
          yPosition += 6;
        });
      } else {
        yPosition = checkForNewPage(yPosition, 6);
        doc.text(`• N/A`, margin + 5, yPosition);
        yPosition += 6;
      }

      doc.text(`Volunteer Tools:`, margin, yPosition);
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      let volunteerToolsList = [];
      if (project.volunteerTools) {
        // Parse the JSON string directly
        volunteerToolsList = JSON.parse(project.volunteerTools);
      }
      if (volunteerToolsList && volunteerToolsList.length > 0) {
        volunteerToolsList.forEach((material) => {
          yPosition = checkForNewPage(yPosition, 6);
          doc.text(`• ${material}`, margin + 5, yPosition);
          yPosition += 6;
        });
      } else {
        yPosition = checkForNewPage(yPosition, 6);
        doc.text(`• N/A`, margin + 5, yPosition);
        yPosition += 6;
      }

      doc.text(`Homeowner Materials:`, margin, yPosition);
      yPosition += 6;

      let homeownerMaterialsList = [];
      if (project.homeownerMaterials) {
        // Parse the JSON string directly
        homeownerMaterialsList = JSON.parse(project.homeownerMaterials);
      }

      // Display the materials as bullets
      if (homeownerMaterialsList && homeownerMaterialsList.length > 0) {
        homeownerMaterialsList.forEach((material) => {
          yPosition = checkForNewPage(yPosition, 6);
          doc.text(`• ${material}`, margin + 5, yPosition);
          yPosition += 6;
        });
      } else {
        yPosition = checkForNewPage(yPosition, 6);
        doc.text(`• N/A`, margin + 5, yPosition);
        yPosition += 6;
      }

      doc.text(`Other Materials:`, margin, yPosition);
      yPosition += 6;

      let otherMaterialsList = [];
      if (project.otherMaterials) {
        // Parse the JSON string directly
        otherMaterialsList = JSON.parse(project.otherMaterials);
      }

      // Display the materials as bullets
      if (otherMaterialsList && otherMaterialsList.length > 0) {
        otherMaterialsList.forEach((material) => {
          yPosition = checkForNewPage(yPosition, 6);
          doc.text(`• ${material}`, margin + 5, yPosition);
          yPosition += 6;
        });
      } else {
        yPosition = checkForNewPage(yPosition, 6);
        doc.text(`• N/A`, margin + 5, yPosition);
        yPosition += 6;
      }

      dividerLine(yPosition);
      yPosition += 10;

      // CONCISE TASK LIST SECTION with images
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CONCISE TASK LIST", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      if (
        project.tasks.tasks &&
        Array.isArray(project.tasks.tasks) &&
        project.tasks.tasks.length > 0
      ) {
        // Sort tasks by priority if needed
        const sortedTasks = [...project.tasks.tasks].sort(
          (a, b) => a.priority - b.priority
        );

        // Function to fetch and add image to PDF
        const addImageToPdf = async (imageUrl, x, y, width, height) => {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const imgData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            // Add the image to PDF
            doc.addImage(imgData, "JPEG", x, y, width, height);
            return true;
          } catch (imgError) {
            console.error("Failed to load task image:", imgError);
            return false;
          }
        };

        // Process tasks sequentially
        for (let taskIndex = 0; taskIndex < sortedTasks.length; taskIndex++) {
          const task = sortedTasks[taskIndex];

          yPosition = checkForNewPage(yPosition, 10); // Check for new page before each task

          // Display task number and priority
          doc.setFont("helvetica", "bold");
          doc.text(`Task ${taskIndex + 1} `, margin, yPosition);
          yPosition += 6;

          // Display todos
          doc.setFont("helvetica", "normal");
          if (
            task.todos &&
            Array.isArray(task.todos) &&
            task.todos.length > 0
          ) {
            task.todos.forEach((todo, todoIndex) => {
              yPosition = checkForNewPage(yPosition, 6);
              doc.text(`• ${todo}`, margin + 5, yPosition);
              yPosition += 6;
            });
          } else {
            yPosition = checkForNewPage(yPosition, 6);
            doc.text(`• No specific todos`, margin + 5, yPosition);
            yPosition += 6;
          }

          // Add task images if available
          if (
            task.photos &&
            Array.isArray(task.photos) &&
            task.photos.length > 0
          ) {
            for (
              let photoIndex = 0;
              photoIndex < task.photos.length;
              photoIndex++
            ) {
              const photoUrl = task.photos[photoIndex];
              if (photoUrl) {
                // Check if we need a new page for the image
                // Assuming image height of 40mm - adjust as needed
                const imageHeight = 40;
                const imageWidth = 60;

                yPosition = checkForNewPage(yPosition, imageHeight + 10); // Space for image + caption

                // Add a small label for the image
                doc.setFont("helvetica", "italic");

                yPosition += 5;

                // Add the image
                try {
                  await addImageToPdf(
                    photoUrl,
                    margin,
                    yPosition,
                    imageWidth,
                    imageHeight
                  );
                  yPosition += imageHeight + 5; // Move position past the image
                } catch (imgError) {
                  doc.text(`[Image could not be loaded]`, margin, yPosition);
                  yPosition += 6;
                }
              }
            }
          }

          // Add a small space between tasks
          yPosition += 6;
        }
      } else {
        doc.text("• No tasks specified", margin, yPosition);
        yPosition += 6;
      }

      yPosition += 4;
      yPosition = checkForNewPage(yPosition, 20); // Space for divider and next section header

      dividerLine(yPosition);
      yPosition += 10;

      // BUDGET SECTION
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BUDGET & HOMEOWNER CONTRIBUTION", margin, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;
      yPosition = checkForNewPage(yPosition);

      doc.setFontSize(10);
      doc.text(
        `Total Budget Estimate: $${project.budget_estimates || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      yPosition = checkForNewPage(yPosition);

      doc.text(
        `Property Owner's Ability Estimates: $${
          project.homeowner_ability_estimates || "N/A"
        }`,
        margin,
        yPosition
      );

      doc.save(fileName);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
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
    fetchProjectsByCommunityId,
    fetchProjectsByCityId,
    fetchProjectsByDaysOfServiceId,
    fetchProjectsByDaysOfStakeId,
    deleteProject,
  };
};

// Helper function to convert data to C
