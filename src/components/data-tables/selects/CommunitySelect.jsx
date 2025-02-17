"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { supabase } from "@/util/supabase";
import { useEffect, useState } from "react";

const CommunitySelect = ({ value, onChange, defaultValue, isMulti = true }) => {
  const [communitySelectOptions, setCommunitySelectOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const fetchCommunities = async () => {
    const { data, error } = await supabase.from("communities").select("*");

    if (error) {
      setError("Error fetching communities");
    } else {
      setCommunitySelectOptions(
        data.map((community) => ({
          value: community.id,
          label: community.name,
        }))
      );
    }
  };

  useEffect(() => {
    fetchCommunities().then(() => {
      setLoading(false);
    });
  }, []);

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
      />
    </>
  );
};

export default CommunitySelect;
