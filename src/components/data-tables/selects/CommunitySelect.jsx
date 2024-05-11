'use client'
import useCommunities from "@/hooks/use-communities";
import MultiSelect from "./MultiSelect";

const CommunitySelect = ({value, onChange, defaultValue}) => {

    const { communitySelectOptions, hasLoaded } = useCommunities();

    return (
       <MultiSelect 
            options={communitySelectOptions} 
            placeholder='Select a Community'
            isLoading={!hasLoaded}
            value={value}
            onChange={onChange}
            defaultValue={defaultValue}
            direction='up'
        />
    );
}

export default CommunitySelect;