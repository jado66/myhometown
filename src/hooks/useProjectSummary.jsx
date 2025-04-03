"use client";

import { useState, useEffect } from "react";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import moment from "moment";

export const useProjectSummary = (daysOfService) => {
  const [projectSummary, setProjectSummary] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { fetchProjectsByDaysOfStakeId } = useDaysOfServiceProjects();

  useEffect(() => {
    const loadProjectSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        if (daysOfService && daysOfService.length > 0) {
          // Create an array to hold all projects
          let allProjects = [];
          // Create a map for easy project lookup
          let projectsMapping = {};

          // For each day of service
          for (const dayOfService of daysOfService) {
            // For each partner stake in this day of service
            if (
              dayOfService.partner_stakes &&
              dayOfService.partner_stakes.length > 0
            ) {
              for (const stake of dayOfService.partner_stakes) {
                // Fetch projects for this stake
                const stakeProjects = await fetchProjectsByDaysOfStakeId(
                  stake.id,
                  false
                );

                if (stakeProjects && stakeProjects.length > 0) {
                  // Map each project to the summary format
                  const mappedProjects = stakeProjects.map((project) => {
                    // Calculate total volunteer hours
                    const volunteerHours =
                      (project.actual_volunteers || 0) *
                      (project.actual_project_duration || 0);

                    // Create date object properly
                    const serviceDate = moment(
                      dayOfService.date || dayOfService.end_date
                    );

                    // Add to project mapping for lookup by ID
                    projectsMapping[project.id] = {
                      id: project.id,
                      name: project.project_name || "Unnamed Project",
                      date: serviceDate,
                      dateStr: serviceDate.format("ddd, MMM DD"),
                      location: project.address_city || "Unknown",
                      stakeName: stake.name,
                      partnerGroup: project.partner_ward,
                      dayOfServiceKey: dayOfService.id || "unknown",
                      dayOfServiceName: dayOfService.name || "Unknown Day",
                    };

                    return {
                      id: project.id,
                      name: project.project_name || "Unnamed Project",
                      date: serviceDate,
                      dateStr: serviceDate.format("ddd, MMM DD"),
                      location: project.address_city || "Unknown",
                      stakeName: stake.name,
                      partnerGroup: project.partner_ward,
                      volunteerCount: project.actual_volunteers || 0,
                      duration: project.actual_project_duration || 0,
                      volunteerHours: volunteerHours,
                      status: project.status || "Pending",
                    };
                  });

                  // Add these projects to our collection
                  allProjects = [...allProjects, ...mappedProjects];
                }
              }
            }
          }

          setProjectSummary(allProjects);
          setProjectsMap(projectsMapping);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectSummary();
  }, [daysOfService]);

  // Calculate total volunteer hours across all projects
  const totalVolunteerHours = projectSummary.reduce(
    (total, project) => total + project.volunteerHours,
    0
  );

  return {
    projectSummary,
    projectsMap,
    totalVolunteerHours,
    loading,
    error,
  };
};
