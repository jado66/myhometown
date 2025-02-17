"use client";

import useUsers from "@/hooks/use-users";
import MultiSelect from "./MultiSelect";
import JsonViewer from "@/components/util/debug/DebugOutput";

const UserSelect = ({ value, onChange, defaultValue, isMulti = true }) => {
  const { userSelectOptions, hasLoaded } = useUsers();

  return (
    <>
      <MultiSelect
        options={userSelectOptions}
        placeholder="Select a User"
        isLoading={!hasLoaded}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        direction="up"
        isMulti={isMulti}
      />
    </>
  );
};

export default UserSelect;
