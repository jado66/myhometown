"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useEffect, useState } from "react";
import { useCommunities } from "@/hooks/use-communities";
import { useUser } from "@/hooks/use-user";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useCommunitiesSupabase } from "@/hooks/use-communities-supabase";

const CommunitySelect = ({
  value,
  onChange,
  defaultValue = null,
  isMulti = true,
  concatCityName = false,
  onLabelChange,
  isNewIds = false,
  placeholder = "Select a Community",
  height = null,
  includeNullOption = false,
}) => {
  const { user } = useUser();
  const { communities, loading } = useCommunities(user);
  const { communities: newIdCommunities, loading: newIdLoading } =
    useCommunitiesSupabase(user);

  // Use the appropriate communities based on isNewIds prop
  const activeCommunities = isNewIds ? newIdCommunities : communities;
  const activeLoading = isNewIds ? newIdLoading : loading;

  // Group communities by city and state for grouped select
  const communitySelectOptions = (() => {
    const grouped = {};

    // Add "All Communities" option at the top if includeNullOption is true
    if (includeNullOption && !isMulti) {
      grouped["_all"] = [
        {
          value: null,
          label: "All Communities",
          city: null,
          state: null,
        },
      ];
    }

    activeCommunities.forEach((comm, index) => {
      // Prefer comm.city_name (top-level), then comm.cities?.city_name, then comm.cities?.name, then comm.city, then "Unknown"
      let city = "Unknown";
      if (typeof comm.city_name === "string" && comm.city_name) {
        city = comm.city_name;
      } else if (comm.cities && typeof comm.cities === "object") {
        city =
          (typeof comm.cities.city_name === "string" &&
            comm.cities.city_name) ||
          (typeof comm.cities.name === "string" && comm.cities.name) ||
          (typeof comm.city === "string" && comm.city) ||
          "Unknown";
      } else {
        city = (typeof comm.city === "string" && comm.city) || "Unknown";
      }
      const state = comm.state || "Unknown";
      const groupLabel = `${city}, ${state}`;
      if (!grouped[groupLabel]) grouped[groupLabel] = [];
      grouped[groupLabel].push({
        // Use a fallback for id - either comm.id, comm._id, or generate one
        value: comm.id || comm._id || `community-${index}`,
        label: concatCityName ? `${city} - ${comm.name}` : comm.name,
        city: city,
        state: comm.state,
      });
    });

    // Return with "All Communities" first if it exists
    const entries = Object.entries(grouped);
    const allEntry = entries.find(([key]) => key === "_all");
    const otherEntries = entries.filter(([key]) => key !== "_all");

    const result = [
      ...(allEntry ? [{ label: "", options: allEntry[1] }] : []),
      ...otherEntries.map(([label, communities]) => ({
        label,
        options: communities,
      })),
    ];

    return result;
  })();

  // Helper to flatten grouped options
  const flattenOptions = (groups) => groups.flatMap((group) => group.options);

  // Ensure value matches the actual option objects for display
  const selectedValues = (() => {
    if (!value) return isMulti ? [] : null;
    const flatOptions = flattenOptions(communitySelectOptions);
    if (isMulti) {
      if (!Array.isArray(value)) return [];
      // value is array of IDs (strings)
      return value
        .map((id) => flatOptions.find((opt) => opt.value === id))
        .filter(Boolean);
    } else {
      return flatOptions.find((opt) => opt.value === value) || null;
    }
  })();

  // Handle change to return just the IDs (not the full objects)
  const handleChange = (selected) => {
    if (isMulti) {
      // For multi-select, return array of IDs
      if (onChange) {
        onChange((selected || []).map((opt) => opt.value));
      }
      if (onLabelChange) {
        onLabelChange((selected || []).map((opt) => opt.label));
      }
    } else {
      // For single select
      if (onChange) {
        onChange(selected ? selected.value : null);
      }
      if (onLabelChange) {
        onLabelChange(selected ? selected.label : "");
      }
    }
  };

  if (activeLoading) {
    return <Loading />;
  }

  return (
    <>
      <MultiSelect
        options={communitySelectOptions}
        placeholder={placeholder}
        isLoading={activeLoading}
        value={selectedValues}
        onChange={handleChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
        isGrouped={true}
        height={height}
        label="Community"
      />
    </>
  );
};

export default CommunitySelect;
