import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";
import { useDaysOfService } from "./useDaysOfService";

export const useDaysOfServiceProjects = () => {
  const [loading, setLoading] = useState(true);

  const { fetchDayOfServiceByShortId } = useDaysOfService();

  const addProject = async (
    newId: string,
    community_id: string,
    city_id: string,
    daysOfServiceShortId: string,
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
        .eq("stake_id", stakeId);

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

      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const generateReports = async (
    type: "single" | "multiple",
    identifier: string, // projectId for single, cityId/communityId/daysOfServiceId for multiple
    filterType?: "cityId" | "communityId" | "daysOfServiceId" // Only used for multiple
  ) => {
    setLoading(true);
    try {
      let projectsData: any[] = [];
      let fileName = "";

      if (type === "single") {
        // Fetch single project with all details
        const { data, error } = await supabase
          .from("days_of_service_project_forms")
          .select("*")
          .eq("id", identifier)
          .single();

        if (error) throw error;
        projectsData = [data];
        fileName = `project_${identifier}_report.csv`;
      } else if (type === "multiple" && filterType) {
        switch (filterType) {
          case "cityId":
            projectsData = (await fetchProjectsByCityId(identifier)) || [];
            fileName = `city_${identifier}_projects_report.csv`;
            break;
          case "communityId":
            projectsData = (await fetchProjectsByCommunityId(identifier)) || [];
            fileName = `community_${identifier}_projects_report.csv`;
            break;
          case "daysOfServiceId":
            projectsData =
              (await fetchProjectsByDaysOfServiceId(identifier)) || [];
            fileName = `days_of_service_${identifier}_projects_report.csv`;
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

      // Convert to CSV and download
      const csvContent = convertToCSV(projectsData);
      downloadCSV(csvContent, fileName);

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
    fetchProjectsByCommunityId,
    fetchProjectsByCityId,
    fetchProjectsByDaysOfServiceId,
    fetchProjectsByDaysOfStakeId,
    deleteProject,
  };
};

// Helper function to convert data to CSV
const convertToCSV = (data: any[], headers?: string[]) => {
  if (!data || data.length === 0) return "";

  // If headers aren't provided, use keys from first object
  const columnHeaders = headers || Object.keys(data[0]);

  const rows = data.map((obj) =>
    columnHeaders
      .map((header) => {
        const value = obj[header] ?? "";
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === "string" && value.includes(",")
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(",")
  );

  return [columnHeaders.join(","), ...rows].join("\n");
};

// Helper function to download CSV
const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
