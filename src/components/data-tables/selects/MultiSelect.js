'use client'

import Select from 'react-select';

const MultiSelect = ({ options, value, onChange, placeholder, isLoading, defaultValue, direction, isMulti = true  }) => {
    return (
        <Select
            direction 
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            defaultValue={defaultValue}
            isLoading = {isLoading}
            className="basic-multi-select"
            classNamePrefix="select"    
            isClearable
            isMulti = {isMulti}
            isSearchable
            menuPlacement={direction === 'up' ? 'top': 'auto'}
        />
    );
}

export default MultiSelect;
