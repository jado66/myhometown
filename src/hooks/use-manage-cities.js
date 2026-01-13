"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
export const newToOldCity = {
  "1ffc6f04-4c38-438a-8c48-dc9a2bbc0305": "66df5865f05bd41ef9493f43",
  "2e4f79c6-bd84-4d48-9538-959ecd07b027": "6876c0292a087f662c17feec",
  "7cbcd408-1c81-4b36-97d6-1213c9065f8f": "66df585ff05bd41ef9493f42",
  "ba0dd989-a0a6-4bf0-8c6d-7d42e9a2dd11": "6838ad5a2243dc8160ce207c",
  "db0e7992-4ce3-464b-9b0b-1ed9a1551086": "663d845ca86c5c22c6ab33b3",
  "dc67276d-6e17-4c79-88aa-00ce07e154de": "66df5855f05bd41ef9493f41",
  "e052f9e9-66a4-4f74-97e9-3836d2ade8fe": "66df586ff05bd41ef9493f44",
};

export default function useManageCities(
  userfilter,
  forDropDownCityMenu = false
) {
  const [groupedCityStrings, setGroupedCityStrings] = useState({});
  const [cities, setCities] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (cities && cities.length > 0) {
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
        let data = await res.json();

        if (data.length === 0) {
        }

        setCities(data);
      } catch (e) {
        console.error("Error occurred while fetching cities", e);
      }

      setHasLoaded(true);
    }

    async function fetchCitiesByIds(ids) {
      try {
        // Convert new format city IDs to old MongoDB format
        const convertedIds = ids.map((id) => newToOldCity[id] || id);
        const res = await fetch(`/api/database/cities/fetchByIds`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(convertedIds),
        });
        const data = await res.json();
        setCities(data);
      } catch (e) {
        console.error("Error occurred while fetching cities", e);
      }

      setHasLoaded(true);
    }

    if (!userfilter && !forDropDownCityMenu) {
      return;
    }

    const isAdministrator = userfilter?.permissions?.administrator;
    const cityIds = userfilter?.cities || [];

    if (isAdministrator || forDropDownCityMenu) {
      fetchAllCities();
    } else {
      fetchCitiesByIds(cityIds);
    }
  }, [userfilter]);

  const handleAddCity = async (city) => {
    try {
      const res = await fetch("/api/database/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });

      const result = await res.json();
      const { city: newCity } = result;
      setCities([...cities, newCity]);
    } catch (e) {
      console.error("Error occurred while adding a city", e);
    }
  };

  const handleEditCity = async (previousCity, city) => {
    try {
      const res = await fetch(`/api/database/cities`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
          previousCity,
        }),
      });

      // Check to see is users has changed
      if (
        JSON.stringify(previousCity.cityOwners) !==
        JSON.stringify(city.cityOwners)
      ) {
        // Make a list of users that need the city added
        const usersToAddCity = city.cityOwners.filter(
          (user) => !previousCity.cityOwners.includes(user)
        );

        handleAddCityToUsers(city, usersToAddCity);

        // Make a list of users that need the city removed
        const usersToRemoveCity = previousCity.cityOwners.filter(
          (user) => !city.cityOwners.includes(user)
        );

        handleDeleteCityFromUsers(city, usersToRemoveCity);
      }

      setCities((prevCities) =>
        prevCities.map((u) => (u._id === city._id ? city : u))
      );
      toast.success("City updated successfully");
    } catch (e) {
      console.error("Error occurred while editing a city", e);
    }
  };

  const handleDeleteCity = async (city) => {
    // Ensure there are no users with this city
    if (city.cityOwners.length > 0) {
      toast.error("Remove all users with this city before deleting it");
      return;
    }

    const cityId = city._id;

    try {
      await fetch(`/api/database/cities`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityId,
        }),
      });

      setCities(cities.filter((u) => u._id !== cityId));
      toast.success("City removed successfully");
    } catch (e) {
      console.error("Error occurred while deleting a city", e);
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
    const res = await fetch("/api/database/users/updateCityOwners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cityToAdd: city,
        cityOwners: users,
      }),
    });
  } catch (e) {
    console.error("Error occurred while adding a city to users", e);
  }
};

const handleDeleteCityFromUsers = async (city, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    const res = await fetch("/api/database/users/updateCityOwners", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cityToRemove: city,
        cityOwners: users,
      }),
    });
  } catch (e) {
    console.error("Error occurred while deleting a city from users", e);
  }
};
