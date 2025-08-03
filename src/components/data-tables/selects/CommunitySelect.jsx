"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useEffect, useState } from "react";
import { useCommunities } from "@/hooks/use-communities";
import { useUser } from "@/hooks/use-user";
import JsonViewer from "@/components/util/debug/DebugOutput";

const CommunitySelect = ({ value, onChange, defaultValue, isMulti = true }) => {
  const { user } = useUser();
  const { communities, loading } = useCommunities(user);

  // Group communities by city and state for grouped select
  const communitySelectOptions = (() => {
    const grouped = {};
    communities.forEach((comm, index) => {
      const city = comm.city || "Unknown";
      const state = comm.state || "Unknown";
      const groupLabel = `${city}, ${state}`;
      if (!grouped[groupLabel]) grouped[groupLabel] = [];
      grouped[groupLabel].push({
        // Use a fallback for id - either comm.id, comm._id, or generate one
        value: comm.id || comm._id || `community-${index}`,
        label: comm.name,
        city: comm.city,
        state: comm.state,
      });
    });
    return Object.entries(grouped).map(([label, communities]) => ({
      label,
      options: communities,
    }));
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
      onChange((selected || []).map((opt) => opt.value));
    } else {
      // For single select
      onChange(selected ? selected.value : null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <JsonViewer
        data={{
          value,
          selectedValues,
          communitySelectOptions,
        }}
      />

      <MultiSelect
        options={communitySelectOptions}
        placeholder="Select a Community"
        isLoading={loading}
        value={selectedValues}
        onChange={handleChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
        isGrouped={true}
      />
    </>
  );
};

export default CommunitySelect;
