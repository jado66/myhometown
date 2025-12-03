"use client";

import MultiSelect from "./MultiSelect";
import Loading from "@/components/util/Loading";
import { useUser } from "@/hooks/use-user";
import useManageCities from "@/hooks/use-manage-cities";
import { useCitiesSupabase } from "@/hooks/use-cities-supabase";

const CitySelect = ({
  value,
  onChange,
  defaultValue = null,
  isMulti = false,
  onLabelChange,
  isNewIds = false,
  placeholder = "Select a City",
  height = null,
  includeNullOption = false,
}) => {
  const { user } = useUser();
  const { cities, loading } = useManageCities(user);
  const { cities: newIdCities, loading: newIdLoading } =
    useCitiesSupabase(user);

  // Use the appropriate cities based on isNewIds prop
  const activeCities = isNewIds ? newIdCities : cities;
  const activeLoading = isNewIds ? newIdLoading : loading;

  // Group cities by state for grouped select
  const citySelectOptions = (() => {
    const grouped = {};

    // Add "All Cities" option at the top if includeNullOption is true
    if (includeNullOption && !isMulti) {
      grouped["_all"] = [
        {
          value: null,
          label: "All Cities",
          city: null,
          state: null,
        },
      ];
    }

    (activeCities || []).forEach((city) => {
      const state = city.state || "Unknown";
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push({
        value: city.id || city._id,
        label: city.name,
        city: city.name,
        state: city.state,
      });
    });

    // Return with "All Cities" first if it exists
    const entries = Object.entries(grouped);
    const allEntry = entries.find(([key]) => key === "_all");
    const otherEntries = entries.filter(([key]) => key !== "_all");

    const result = [
      ...(allEntry ? [{ label: "", options: allEntry[1] }] : []),
      ...otherEntries.map(([state, cities]) => ({
        label: state,
        options: cities,
      })),
    ];

    return result;
  })();

  // Helper to flatten grouped options
  const flattenOptions = (groups) => groups.flatMap((group) => group.options);

  // Ensure value matches the actual option objects for display
  const selectedValues = (() => {
    if (!value) return isMulti ? [] : null;
    const flatOptions = flattenOptions(citySelectOptions);
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
        options={citySelectOptions}
        placeholder={placeholder}
        isLoading={activeLoading}
        value={selectedValues}
        onChange={handleChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
        isGrouped={true}
        height={height}
        label="City"
      />
    </>
  );
};

export default CitySelect;
