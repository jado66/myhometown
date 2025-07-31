"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useEffect, useState } from "react";
import { useCommunities } from "@/hooks/use-communities";
import { useUser } from "@/hooks/use-user";

const CommunitySelect = ({ value, onChange, defaultValue, isMulti = true }) => {
  const { user } = useUser();
  const { communities, loading } = useCommunities(user);

  // Group communities by city and state for grouped select
  const communitySelectOptions = (() => {
    const grouped = {};
    communities.forEach((comm) => {
      const city = comm.city || "Unknown";
      const state = comm.state || "Unknown";
      const groupLabel = `${city}, ${state}`;
      if (!grouped[groupLabel]) grouped[groupLabel] = [];
      grouped[groupLabel].push({
        value: comm.id,
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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <MultiSelect
        options={communitySelectOptions}
        placeholder="Select a Community"
        isLoading={loading}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
        isGrouped={true}
      />
    </>
  );
};

export default CommunitySelect;
