"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase";

const CitySelect = ({ value, onChange, defaultValue, isMulti = true }) => {
  const [citySelectOptions, setCitySelectOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const fetchCities = async () => {
    const { data, error } = await supabase.from("cities").select("*");

    if (error) {
      setError("Error fetching cities");
    } else {
      setCitySelectOptions(
        data.map((city) => ({
          value: city.id,
          label: city.name,
        }))
      );
    }
  };

  useEffect(() => {
    fetchCities().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <MultiSelect
        options={citySelectOptions}
        placeholder="Select a City"
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

export default CitySelect;
