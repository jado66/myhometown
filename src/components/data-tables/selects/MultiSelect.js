"use client";

import Select, { components } from "react-select";

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
  height = null,
  clearIcon = null,
  isClearable = null,
  label = null,
}) => {
  // Custom clear indicator component
  const ClearIndicator = (props) => {
    if (clearIcon) {
      return (
        <components.ClearIndicator {...props}>
          {clearIcon}
        </components.ClearIndicator>
      );
    }
    return <components.ClearIndicator {...props} />;
  };

  // Determine if clearable - use prop if provided, otherwise default to isMulti
  const shouldBeClearable = isClearable !== null ? isClearable : isMulti;

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <label
          style={{
            position: "absolute",
            top: "-9px",
            left: "10px",
            backgroundColor: "white",
            padding: "0 4px",
            fontSize: "12px",
            color: "#318D43",
            zIndex: 1,
          }}
        >
          {label}
        </label>
      )}
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        defaultValue={defaultValue}
        isLoading={isLoading}
        className="basic-multi-select"
        classNamePrefix="select"
        isClearable={shouldBeClearable}
        isMulti={isMulti}
        isSearchable
        isGrouped={isGrouped}
        components={{ ClearIndicator }}
        styles={{
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
          control: (provided) => ({
            ...provided,
            ...(height && { minHeight: height, height: height }),
          }),
        }}
        menuPlacement={direction === "up" ? "top" : "auto"}
      />
    </div>
  );
};

export default MultiSelect;
