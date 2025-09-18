"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useUser } from "@/hooks/use-user";
import useManageCities from "@/hooks/use-manage-cities";

const CitySelect = ({
  value,
  onChange,
  defaultValue = null,
  isMulti = false,
  onLabelChange,
}) => {
  const { user } = useUser();
  const { cities, loading } = useManageCities(user);

  // Group cities by state for grouped select
  const citySelectOptions = (() => {
    const grouped = {};
    (cities || []).forEach((city) => {
      const state = city.state || "Unknown";
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push({
        value: city.id,
        label: city.name,
        city: city.name,
        state: city.state,
      });
    });
    return Object.entries(grouped).map(([state, cities]) => ({
      label: state,
      options: cities,
    }));
  })();

  // Handle change to pass both value and label
  const handleChange = (selected) => {
    if (onChange) {
      onChange(selected ? selected.value : null);
    }
    if (onLabelChange) {
      onLabelChange(selected ? selected.label : "");
    }
  };

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
        onChange={handleChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
        isGrouped={true}
      />
    </>
  );
};

export default CitySelect;
