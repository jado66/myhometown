"use client";

import Select from "react-select";

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
  isLoading,
  defaultValue,
  direction,
  isMulti = true,
  isGrouped = false,
}) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      defaultValue={defaultValue}
      isLoading={isLoading}
      className="basic-multi-select"
      classNamePrefix="select"
      isClearable={isMulti}
      isMulti={isMulti}
      isSearchable
      isGrouped={isGrouped}
      styles={{
        menu: (provided) => ({
          ...provided,
          zIndex: 9999,
        }),
      }}
      menuPlacement={direction === "up" ? "top" : "auto"}
    />
  );
};

export default MultiSelect;
