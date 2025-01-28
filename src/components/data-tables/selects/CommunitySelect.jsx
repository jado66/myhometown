"use client";
import useCommunities from "@/hooks/use-communities";
import MultiSelect from "./MultiSelect";
import JsonViewer from "@/components/util/debug/DebugOutput";

const CommunitySelect = ({ value, onChange, defaultValue }) => {
  const { communitySelectOptions, hasLoaded, communities } = useCommunities(
    null,
    true
  );

  return (
    <>
      <JsonViewer data={communities} title="Communities" />
      <MultiSelect
        options={communitySelectOptions}
        placeholder="Select a Community"
        isLoading={!hasLoaded}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        direction="up"
      />
    </>
  );
};

export default CommunitySelect;
