'use client'

import Select from 'react-select';

const MultiSelect = ({ options, value, onChange, placeholder, isLoading, defaultValue }) => {
    return (
        <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            defaultValue={defaultValue}
            isLoading = {isLoading}
            className="basic-multi-select"
            classNamePrefix="select"    
            isClearable
            isMulti
            isSearchable

        />
    );
}

export default MultiSelect;
