import React, { createContext, useEffect, useState } from 'react';

export const EditCityContext = createContext();

const EditCityProvider = ({ children }) => {
    const [initialCityData, setInitialCityData] = useState({}); // [1
    const [cityData, setCityData] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (cityData){
            if (hasLoaded) {
                setIsDirty(JSON.stringify(cityData) !== JSON.stringify(initialCityData));
            }
            else{
                setInitialCityData(cityData)
                setHasLoaded(true)
            }
        }
    }, [cityData]);

    const saveCityData = async () => {
        try {
            const response = await fetch(`/api/database/cities/${cityData.state}/${cityData.name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({city:cityData}),
            });

            if (response.ok) {
                console.log('City data saved successfully');
            } else {
                console.error('Failed to save city data');
            }
        } catch (error) {
            console.error('An error occurred while saving city data:', error);
        }
    };

    return (
        <EditCityContext.Provider value={{ cityData, setCityData, saveCityData, isDirty }}>
            {children}
        </EditCityContext.Provider>
    );
};

export default EditCityProvider;
