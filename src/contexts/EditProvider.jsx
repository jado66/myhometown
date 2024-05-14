import React, { createContext, useEffect, useState } from 'react';

export const EditContext = createContext();

const EditProvider = ({ children }) => {
    const [initialData, setInitialData] = useState({}); // [1
    const [data, setData] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (data){
            if (hasLoaded) {
                setIsDirty(JSON.stringify(data) !== JSON.stringify(initialData));
            }
            else{
                setInitialData(data)
                setHasLoaded(true)
            }
        }
    }, [data]);

    const saveCityData = async () => {
        try {
            const response = await fetch(`/api/database/cities/${data.state}/${data.name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({city:data}),
            });

            if (response.ok) {
                console.log(' data saved successfully');
            } else {
                console.error('Failed to save  data');
            }
        } catch (error) {
            console.error('An error occurred while saving  data:', error);
        }
    };
    
    const saveCommunityData = async () => {
        try {
            const response = await fetch(`/api/database/communities/${data.city.state}/${data.city}/${data.name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({community:data}),
            });

            if (response.ok) {
                console.log(' data saved successfully');
            } else {
                console.error('Failed to save  data');
            }
        } catch (error) {
            console.error('An error occurred while saving  data:', error);
        }
    };


    return (
        <EditContext.Provider 
            value={{ 
                data, 
                setData, 
                saveCityData,
                saveCommunityData, 
                isDirty 
            }}
        >
            {children}
        </EditContext.Provider>
    );
};

export default EditProvider;
