import { useState, useEffect } from 'react';
import { mockCities } from './mockCities';
import { mergeObjectTemplate } from '@/util/mergeObjectTemplate';

export default function useCity(cityQuery, stateQuery, template = {}) {
    const [city, setCity] = useState({});
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleSaveCity = async (city) => {

      try {
        const res = await fetch(`/api/database/cities`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            city
          })
        });

        toast.success('City updated successfully');
        } catch (e) {
        console.error('Error occurred while editing a city', e);
      }
    };

    useEffect(() => {

      const fetchCity = async () => {
        try {
          const res = await fetch(`/api/database/cities/${stateQuery}/${cityQuery}`);
          
          // Check if response status is either 404 or 403 before fetching json data
          if(res.status === 404 || res.status === 403) {
            console.error('Unable to access the requested resource. Status Code:', res.status);
            setCity(null);
            setHasLoaded(true);
            return;
          }
          
          const data = await res.json();

          const mergedCity = mergeObjectTemplate(data[0], template);

          setCity(mergedCity);
          setHasLoaded(true);
        } catch (e) {
          console.error('Error occurred while fetching city', e);
        }
      };

      fetchCity();

    }, [cityQuery]);

    return {
        city,
        hasLoaded,
        handleSaveCity
    };
}