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
}) => {
  return (
    <Select
      direction
      options={options}
      // z-index: 9999

      value={value}
      onChange={onChange}
      placeholder={placeholder}
      defaultValue={defaultValue}
      isLoading={isLoading}
      className="basic-multi-select"
      classNamePrefix="select"
      isClearable
      isMulti={isMulti}
      isSearchable
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
