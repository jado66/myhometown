'use client'

import useUsers from "@/hooks/use-users";
import MultiSelect from "./MultiSelect";

const UserSelect = ({value, onChange, defaultValue}) => {

    const { selectOptions, hasLoaded } = useUsers();

    return (
       <MultiSelect 
            options={selectOptions} 
            placeholder='Select a User'
            isLoading={!hasLoaded}
            value={value}
            onChange={onChange}
            defaultValue={defaultValue}
        />
    );
}

export default UserSelect;