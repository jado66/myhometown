"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

export function useCitiesSupabase(userfilter, forDropDownCityMenu = false) {
  const [groupedCityStrings, setGroupedCityStrings] = useState({});
  const [cities, setCities] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .order("state", { ascending: true })
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching cities:", error);
          toast.error("Failed to fetch cities");
          return;
        }

        setCities(data || []);
      } catch (e) {
        console.error("Error occurred while fetching cities", e);
        toast.error("An error occurred while fetching cities");
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    }

    async function fetchCitiesByIds(ids) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .in("id", ids)
          .order("state", { ascending: true })
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching cities by IDs:", error);
          toast.error("Failed to fetch cities");
          return;
        }

        setCities(data || []);
      } catch (e) {
        console.error("Error occurred while fetching cities", e);
        toast.error("An error occurred while fetching cities");
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
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
  }, [userfilter, forDropDownCityMenu]);

  const handleAddCity = async (city) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cities")
        .insert([
          {
            name: city.name,
            state: city.state,
            country: city.country || "USA",
            visibility: city.visibility !== undefined ? city.visibility : true,
            image_url: city.image_url || "",
            upcoming_events: city.upcoming_events || [],
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding city:", error);
        toast.error("Failed to add city");
        return;
      }

      setCities([...cities, data]);
      toast.success("City added successfully");
      return data;
    } catch (e) {
      console.error("Error occurred while adding a city", e);
      toast.error("An error occurred while adding the city");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCity = async (previousCity, city) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cities")
        .update({
          name: city.name,
          state: city.state,
          country: city.country,
          visibility: city.visibility,
          image_url: city.image_url,
          upcoming_events: city.upcoming_events,
        })
        .eq("id", city.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating city:", error);
        toast.error("Failed to update city");
        return;
      }

      // Check to see if users have changed (if cityOwners is part of your data model)
      if (
        city.cityOwners &&
        previousCity.cityOwners &&
        JSON.stringify(previousCity.cityOwners) !==
          JSON.stringify(city.cityOwners)
      ) {
        // Make a list of users that need the city added
        const usersToAddCity = city.cityOwners.filter(
          (user) => !previousCity.cityOwners.includes(user)
        );

        await handleAddCityToUsers(city, usersToAddCity);

        // Make a list of users that need the city removed
        const usersToRemoveCity = previousCity.cityOwners.filter(
          (user) => !city.cityOwners.includes(user)
        );

        await handleDeleteCityFromUsers(city, usersToRemoveCity);
      }

      setCities((prevCities) =>
        prevCities.map((c) => (c.id === city.id ? data : c))
      );
      toast.success("City updated successfully");
      return data;
    } catch (e) {
      console.error("Error occurred while editing a city", e);
      toast.error("An error occurred while updating the city");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCity = async (city) => {
    // Ensure there are no users with this city
    if (city.cityOwners && city.cityOwners.length > 0) {
      toast.error("Remove all users with this city before deleting it");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", city.id);

      if (error) {
        console.error("Error deleting city:", error);
        toast.error("Failed to delete city");
        return;
      }

      setCities(cities.filter((c) => c.id !== city.id));
      toast.success("City removed successfully");
    } catch (e) {
      console.error("Error occurred while deleting a city", e);
      toast.error("An error occurred while deleting the city");
    } finally {
      setLoading(false);
    }
  };

  return {
    cities,
    groupedCityStrings,
    hasLoaded,
    loading,
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
    // This assumes you have a users table with a cities relationship
    // Adjust based on your actual user-city relationship schema
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

    if (!res.ok) {
      throw new Error("Failed to add city to users");
    }
  } catch (e) {
    console.error("Error occurred while adding a city to users", e);
    toast.error("Failed to update user city assignments");
  }
};

const handleDeleteCityFromUsers = async (city, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    // This assumes you have a users table with a cities relationship
    // Adjust based on your actual user-city relationship schema
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

    if (!res.ok) {
      throw new Error("Failed to remove city from users");
    }
  } catch (e) {
    console.error("Error occurred while deleting a city from users", e);
    toast.error("Failed to update user city assignments");
  }
};
