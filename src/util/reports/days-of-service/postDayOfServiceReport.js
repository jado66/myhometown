import { supabase } from "@/util/supabase";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import moment from "moment";

// Helper function to fetch image as base64
const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw error;
  }
};

// Helper function to parse Lexical JSON content and extract text
const parseLexicalContent = (lexicalJson) => {
  if (!lexicalJson) return "";

  let parsedData;
  try {
    // If it's a string, parse it; if it's already an object, use it directly
    parsedData =
      typeof lexicalJson === "string" ? JSON.parse(lexicalJson) : lexicalJson;
  } catch (e) {
    console.error("Failed to parse Lexical JSON:", e);
    return "";
  }

  const extractTextFromNode = (node) => {
    if (!node) return "";

    // Handle different node types
    switch (node.type) {
      case "text":
        return node.text || "";

      case "paragraph":
        if (node.children && node.children.length > 0) {
          return node.children.map(extractTextFromNode).join("") + "\n";
        }
        return "\n";

      case "layout-container":
        if (node.children && node.children.length > 0) {
          return node.children.map(extractTextFromNode).join(" | ") + "\n";
        }
        return "";

      case "layout-item":
        if (node.children && node.children.length > 0) {
          return node.children.map(extractTextFromNode).join("");
        }
        return "";

      case "root":
        if (node.children && node.children.length > 0) {
          return node.children.map(extractTextFromNode).join("");
        }
        return "";

      case "youtube":
        // Handle YouTube embeds by returning the URL
        return `[YouTube Video: ${
          node.videoID
            ? `https://www.youtube.com/watch?v=${node.videoID}`
            : "Video URL not available"
        }]\n`;

      default:
        // For unknown node types, try to extract from children
        if (node.children && node.children.length > 0) {
          return node.children.map(extractTextFromNode).join("");
        }
        return "";
    }
  };

  return extractTextFromNode(parsedData.root || parsedData);
};

const fetchProjectsByDaysOfStakeId = async (stakeId, includeBudget = false) => {
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

/**
 * Generates a comprehensive reporting PDF for all projects in a stake
 * Shows reported tasks with images and rich text content
 */
export const generateStakeReportingReport = async (
  stakeId,
  dateOfService,
  dayOfService,
  setLoading
) => {
  if (setLoading) setLoading(true);

  try {
    // Fetch projects with reporting data
    const projectsData = await fetchProjectsByDaysOfStakeId(stakeId, false);

    if (!projectsData || projectsData.length === 0) {
      toast.warning("No projects found to generate report");
      return;
    }

    // Filter projects that have reporting data
    const projectsWithReporting = projectsData.filter(
      (project) =>
        (project.reported_tasks && project.reported_tasks.length > 0) ||
        project.report_content
    );

    if (projectsWithReporting.length === 0) {
      toast.warning("No projects with reporting data found");
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
    const margin = 10;
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

    // Helper functions
    const checkForNewPage = (currentY, heightNeeded = 15) => {
      if (currentY + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return yPosition;
      }
      return currentY;
    };

    const dividerLine = (yPos) => {
      doc.setLineWidth(0.5);
      doc.setDrawColor(100, 100, 100);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    const addPageHeader = () => {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Day of Service Project Reports", margin, yPosition + 6);

      if (imgData) {
        doc.addImage(
          imgData,
          "PNG",
          pageWidth - logoWidth - margin,
          yPosition,
          logoWidth,
          logoHeight
        );
      }

      yPosition += logoHeight + 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Partner Organization: ${partnerStake?.name || "N/A"}`,
        margin,
        yPosition
      );
      yPosition += 6;
      doc.text(`Date of Service: ${formattedDate}`, margin, yPosition);
      yPosition += 6;
      doc.text(
        `Projects with Reports: ${projectsWithReporting.length}`,
        margin,
        yPosition
      );
      yPosition += 8;

      dividerLine(yPosition);
      yPosition += 10;
    };

    // Add header
    addPageHeader();

    // Process each project
    for (let i = 0; i < projectsWithReporting.length; i++) {
      const project = projectsWithReporting[i];

      // Check if we need a new page
      yPosition = checkForNewPage(yPosition, 80);

      // Project header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 102, 204); // Blue color
      const projectName = project.project_name || `Project ${i + 1}`;
      doc.text(projectName, margin, yPosition);
      yPosition += 8;

      // Project details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Black color

      if (project.address_street1 || project.address_city) {
        const address = concatenateAddress(project);
        doc.text(`Location: ${address}`, margin, yPosition);
        yPosition += 5;
      }

      if (project.partner_ward) {
        doc.text(`Partner Group: ${project.partner_ward}`, margin, yPosition);
        yPosition += 5;
      }

      if (project.actual_volunteers || project.actual_project_duration) {
        const stats = [
          project.actual_volunteers
            ? `Volunteers: ${project.actual_volunteers}`
            : "",
          project.actual_project_duration
            ? `Duration: ${project.actual_project_duration} hours`
            : "",
        ]
          .filter(Boolean)
          .join(" • ");

        if (stats) {
          doc.text(stats, margin, yPosition);
          yPosition += 8;
        }
      }

      // Rich text report content
      if (project.report_content) {
        yPosition = checkForNewPage(yPosition, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Project Report:", margin, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const reportText = parseLexicalContent(project.report_content);
        if (reportText.trim()) {
          const wrappedText = doc.splitTextToSize(reportText.trim(), maxWidth);

          // Handle line breaks and ensure we don't exceed page boundaries
          for (let lineIndex = 0; lineIndex < wrappedText.length; lineIndex++) {
            yPosition = checkForNewPage(yPosition, 5);
            doc.text(wrappedText[lineIndex], margin, yPosition);
            yPosition += 5;
          }
        } else {
          doc.text("No report content available", margin, yPosition);
          yPosition += 5;
        }

        yPosition += 8;
      }

      // Reported tasks with images
      if (project.reported_tasks && project.reported_tasks.length > 0) {
        yPosition = checkForNewPage(yPosition, 30);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Project Tasks & Progress Photos:", margin, yPosition);
        yPosition += 8;

        // Sort tasks by priority
        const sortedTasks = [...project.reported_tasks].sort(
          (a, b) => (a.priority || 0) - (b.priority || 0)
        );

        for (let taskIndex = 0; taskIndex < sortedTasks.length; taskIndex++) {
          const task = sortedTasks[taskIndex];

          yPosition = checkForNewPage(yPosition, 60);

          // Task header
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`Task ${taskIndex + 1}:`, margin, yPosition);
          yPosition += 6;

          // Task description (todos)
          if (
            task.todos &&
            task.todos.length > 0 &&
            task.todos.some((todo) => todo.trim())
          ) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const validTodos = task.todos.filter((todo) => todo && todo.trim());
            if (validTodos.length > 0) {
              validTodos.forEach((todo) => {
                const wrappedTodo = doc.splitTextToSize(
                  `• ${todo}`,
                  maxWidth - 10
                );
                wrappedTodo.forEach((line) => {
                  yPosition = checkForNewPage(yPosition, 4);
                  doc.text(line, margin + 10, yPosition);
                  yPosition += 4;
                });
              });
            }
            yPosition += 4;
          }

          // Images (before, during, after)
          if (task.images && task.images.length > 0) {
            yPosition = checkForNewPage(yPosition, 100);

            // Group images by type
            const beforeImages = task.images.filter(
              (img) => img.type === "before"
            );
            const duringImages = task.images.filter(
              (img) => img.type === "during"
            );
            const afterImages = task.images.filter(
              (img) => img.type === "after"
            );

            const imageWidth = (maxWidth - 20) / 3; // Three columns for before/during/after
            const imageHeight = 45;
            const imageSpacing = 10;

            // Process image sets
            const maxImages = Math.max(
              beforeImages.length,
              duringImages.length,
              afterImages.length
            );

            for (let imgIndex = 0; imgIndex < maxImages; imgIndex++) {
              yPosition = checkForNewPage(yPosition, imageHeight + 20);

              const startY = yPosition;

              // Before image
              if (beforeImages[imgIndex]) {
                try {
                  doc.setFontSize(8);
                  doc.setFont("helvetica", "bold");
                  doc.text("BEFORE", margin, startY);

                  const beforeImgData = await fetchImageAsBase64(
                    beforeImages[imgIndex].url
                  );
                  doc.addImage(
                    beforeImgData,
                    "JPEG",
                    margin,
                    startY + 5,
                    imageWidth,
                    imageHeight,
                    undefined,
                    "FAST"
                  );
                } catch (error) {
                  doc.setFontSize(8);
                  doc.text("[Before image not available]", margin, startY + 25);
                }
              }

              // During image
              if (duringImages[imgIndex]) {
                try {
                  doc.setFontSize(8);
                  doc.setFont("helvetica", "bold");
                  doc.text(
                    "DURING",
                    margin + imageWidth + imageSpacing,
                    startY
                  );

                  const duringImgData = await fetchImageAsBase64(
                    duringImages[imgIndex].url
                  );
                  doc.addImage(
                    duringImgData,
                    "JPEG",
                    margin + imageWidth + imageSpacing,
                    startY + 5,
                    imageWidth,
                    imageHeight,
                    undefined,
                    "FAST"
                  );
                } catch (error) {
                  doc.setFontSize(8);
                  doc.text(
                    "[During image not available]",
                    margin + imageWidth + imageSpacing,
                    startY + 25
                  );
                }
              }

              // After image
              if (afterImages[imgIndex]) {
                try {
                  doc.setFontSize(8);
                  doc.setFont("helvetica", "bold");
                  doc.text(
                    "AFTER",
                    margin + 2 * (imageWidth + imageSpacing),
                    startY
                  );

                  const afterImgData = await fetchImageAsBase64(
                    afterImages[imgIndex].url
                  );
                  doc.addImage(
                    afterImgData,
                    "JPEG",
                    margin + 2 * (imageWidth + imageSpacing),
                    startY + 5,
                    imageWidth,
                    imageHeight,
                    undefined,
                    "FAST"
                  );
                } catch (error) {
                  doc.setFontSize(8);
                  doc.text(
                    "[After image not available]",
                    margin + 2 * (imageWidth + imageSpacing),
                    startY + 25
                  );
                }
              }

              yPosition = startY + imageHeight + 15;
            }
          }

          yPosition += 10; // Space between tasks
        }
      }

      // Add separator between projects (except for the last one)
      if (i < projectsWithReporting.length - 1) {
        yPosition += 10;
        yPosition = checkForNewPage(yPosition, 15);
        dividerLine(yPosition);
        yPosition += 15;
      }
    }

    // Add page numbers
    const totalPages = doc.getNumberOfPages();
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
      doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 5
      );
    }

    // Save PDF
    const fileName = `${
      partnerStake?.name || "Stake"
    }_Reporting_${formattedDate}.pdf`;
    doc.save(fileName);
    toast.success("Stake reporting report generated successfully");
  } catch (error) {
    console.error("Failed to generate stake reporting report:", error);
    toast.error("Failed to generate reporting report");
  } finally {
    if (setLoading) setLoading(false);
  }
};

// Add this function to handle the reporting report generation
export const handleGenerateReportingReport = async (
  stakeId,
  dateOfService,
  dayOfService
) => {
  try {
    await generateStakeReportingReport(stakeId, dateOfService, dayOfService);
  } catch (error) {
    console.error("Error generating reporting report:", error);
    toast.error("Failed to generate reporting report");
  }
};
const formatSafeDate = (date) => {
  try {
    return moment(date).format("MMMM D, YYYY");
  } catch (error) {
    return "N/A";
  }
};

// Helper function to concatenate address parts
const concatenateAddress = (project) => {
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
