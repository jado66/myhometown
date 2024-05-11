import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useCities(userfilter, forDropDownCityMenu = false) {
    const [groupedCityStrings, setGroupedCityStrings] = useState({});
    const [cities, setCities] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
  
    useEffect(() => {
      if (cities) {
          const grpCityStrs = cities.reduce((acc, currentCity) => {
              const { state, name, visibility } = currentCity;
                
              // Only process and add city if visibility is true
              if (visibility) {
                  if (!acc[state]) acc[state] = []; // Initialize if this state does not exist yet
                  acc[state].push(name);
              }
                
              return acc;
          }, {});
          setGroupedCityStrings(grpCityStrs);
      }
  }, [cities]);

    useEffect(() => {
      
      async function fetchAllCities() {
        try {
          const res = await fetch(`/api/database/cities`);
          const data = await res.json();
          setCities(data);
        
        } catch (e) {
        console.error('Error occurred while fetching cities', e);
        }
        
        setHasLoaded(true);
      }

        async function fetchCitiesByIds(ids) {
          try {
            const res = await fetch(`/api/database/cities/fetchByIds`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(ids)
            });
            const data = await res.json();
            setCities(data);
          
          } catch (e) {
          console.error('Error occurred while fetching cities', e);
          }
          
          setHasLoaded(true);
      }


      if (!userfilter && !forDropDownCityMenu) {
        return;
      }

      if (userfilter?.role === 'Admin' || forDropDownCityMenu) {
        fetchAllCities();
      } else {

        const cityIds = userfilter.cities.map((city) => city._id);

        fetchCitiesByIds(cityIds);

      }
    }, [userfilter]);
  
    const handleAddCity = async (city) => {
      try {
        const res = await fetch('/api/database/cities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({city})
        });
        
        const result = await res.json();
        const {city: newCity} = result;
        setCities([...cities, newCity]);
        
      } catch (e) {
        console.error('Error occurred while adding a city', e);
      }
    };

    
  
    const handleEditCity = async (previousCity, city) => {

      try {
        const res = await fetch(`/api/database/cities`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            city,
            previousCity
          })
        });

        // Check to see is users has changed
        if (JSON.stringify(previousCity.cityOwners) !== JSON.stringify(city.cityOwners)) {

          // Make a list of users that need the city added
          const usersToAddCity = city.cityOwners.filter((user) => !previousCity.cityOwners.includes(user));

          handleAddCityToUsers(city, usersToAddCity)

          // Make a list of users that need the city removed
          const usersToRemoveCity = previousCity.cityOwners.filter((user) => !city.cityOwners.includes(user));

          handleDeleteCityFromUsers(city, usersToRemoveCity)
        } 
  
        setCities(prevCities => prevCities.map((u) => u._id === city._id ? city : u));
        toast.success('City updated successfully');

      } catch (e) {
        console.error('Error occurred while editing a city', e);
      }
    };
  
    const handleDeleteCity = async (city) => {

      // Ensure there are no users with this city
      if (city.cityOwners.length > 0) {
        toast.error('Remove all users with this city before deleting it');
        return;
      }

      const cityId = city._id;

      try {
        await fetch(`/api/database/cities`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cityId
          })
        });
  
        setCities(cities.filter((u) => u._id !== cityId));
        toast.success('City removed successfully');

      } catch (e) {
        console.error('Error occurred while deleting a city', e);
      }
    };
  
    return {
      cities,
      groupedCityStrings,
      hasLoaded,
      handleAddCity,
      handleEditCity,
      handleDeleteCity,
    };
  }

// Util functions not passed down

const handleAddCityToUsers = async (city, users) => {

  if (users.length === 0) {
    return;
  }

  try { 
    const res = await fetch('/api/database/users/updateCityOwners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cityToAdd: city,
        cityOwners: users
      })
    });
  }
  catch (e) {
    console.error('Error occurred while adding a city to users', e);
  }
}

const handleDeleteCityFromUsers = async (city, users) => {
  if (users.length === 0) {
    return;
  }
  
  try {
    const res = await fetch('/api/database/users/updateCityOwners', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cityToRemove: city,
        cityOwners: users
      })
    });
  }
  catch (e) {
    console.error('Error occurred while deleting a city from users', e);
  }
}