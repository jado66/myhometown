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

  const fetchProjectsByDaysOfServiceId = async (daysOfServiceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("days_of_service_project_forms")
        .select("*")
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

  return {
    loading,
    addProject,
    fetchProjectsByCommunityId,
    fetchProjectsByCityId,
    fetchProjectsByDaysOfServiceId,
    deleteProject,
  };
};
