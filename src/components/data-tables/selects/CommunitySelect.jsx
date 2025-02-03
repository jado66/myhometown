"use client";
import { useCommunities } from "@/hooks/use-communities";
import MultiSelect from "./MultiSelect";
import JsonViewer from "@/components/util/debug/DebugOutput";

const CommunitySelect = ({ value, onChange, defaultValue, isMulti }) => {
  const { communitySelectOptions, hasLoaded, communities } = useCommunities(
    null,
    true
  );

  // Transform value to match react-select format if it's not already formatted
  const formattedValue = value
    ? Array.isArray(value)
      ? value.map((v) =>
          typeof v === "string"
            ? communitySelectOptions.find((opt) => opt.value === v)
            : v
        )
      : communitySelectOptions.find((opt) => opt.value === value)
    : null;

  // Transform defaultValue similarly
  const formattedDefaultValue = defaultValue
    ? Array.isArray(defaultValue)
      ? defaultValue.map((v) =>
          typeof v === "string"
            ? communitySelectOptions.find((opt) => opt.value === v)
            : v
        )
      : communitySelectOptions.find((opt) => opt.value === defaultValue)
    : null;

  console.log("hasLoaded:", hasLoaded);
  console.log("communities:", communities);
  console.log("communitySelectOptions:", communitySelectOptions);

  return (
    <>
      <MultiSelect
        isMulti={isMulti}
        options={communitySelectOptions}
        placeholder="Select a Community"
        isLoading={!hasLoaded}
        value={formattedValue}
        onChange={onChange}
        defaultValue={formattedDefaultValue}
        direction="down"
      />
    </>
  );
};

export default CommunitySelect;
