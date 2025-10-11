import { supabase } from "@/util/supabase";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const initialUserState = {
  email: "",
  name: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  permissions: {
    texting: false,
    administrator: false,
    dos_admin: false,
    content_development: false,
    missionary_volunteer_management: false,
    classes_admin: false,
  },
  cities: [],
  communities: [],
};

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [userSelectOptions, setUserSelectOptions] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users_with_details").select(`
          *,
          cities_details,
          communities_details
        `);

      if (error) throw error;

      // Filter out system user and format the data
      const formattedUsers = data
        .filter((user) => user.email !== "system@unauthenticated.local")
        .map((user) => ({
          ...user,
          id: user.id,
          last_sign_in_at: user.last_sign_in_at,
          permissions: user.permissions || initialUserState.permissions,
          cities: user.cities_details || [],
          communities: user.communities_details || [],
        }));

      setUsers(formattedUsers);

      const selectOptions = formattedUsers.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        data: user,
      }));
      setUserSelectOptions(selectOptions);
    } catch (e) {
      console.error("Error occurred while fetching users", e);
      setError("Failed to fetch users");
    } finally {
      setHasLoaded(true);
    }
  };

  const handleAddUser = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Starting user invitation process...");

      // Send the full user data to the API so it can create the user record immediately
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          userData: userData, // Pass the full user data
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send invitation");
      }

      const responseData = await response.json();
      console.log("Invitation API response:", responseData);

      const invitedUser = responseData.data?.user;
      const userRecord = responseData.data?.userRecord;

      if (!invitedUser || !invitedUser.id) {
        throw new Error("No user ID returned from invitation API");
      }

      console.log("User auth created with ID:", invitedUser.id);
      console.log("User record created:", !!userRecord);

      // Ensure cities and communities are arrays of IDs
      const cityIds = Array.isArray(userData.cities)
        ? userData.cities.map((c) => (typeof c === "object" && c.id ? c.id : c))
        : [];
      const communityIds = Array.isArray(userData.communities)
        ? userData.communities.map((c) =>
            typeof c === "object" && c.id ? c.id : c
          )
        : [];

      // Create user record if API didn't create it
      let finalUserRecord = userRecord;
      if (!userRecord) {
        console.log("Creating user record as fallback...");

        const { data, error: dbError } = await supabase
          .from("users")
          .insert([
            {
              id: invitedUser.id,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              contact_number: userData.contact_number,
              permissions: userData.permissions,
              cities: cityIds,
              communities: communityIds,
            },
          ])
          .select()
          .single();

        if (dbError) {
          if (dbError.code === "23505") {
            // User already exists, try to update
            const { data: updateData, error: updateError } = await supabase
              .from("users")
              .update({
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                contact_number: userData.contact_number,
                permissions: userData.permissions,
                cities: cityIds,
                communities: communityIds,
              })
              .eq("id", invitedUser.id)
              .select()
              .single();

            if (updateError) {
              throw new Error(
                `Failed to update user record: ${updateError.message}`
              );
            }
            finalUserRecord = updateData;
          } else {
            throw new Error(`Failed to create user record: ${dbError.message}`);
          }
        } else {
          finalUserRecord = data;
        }
      }

      console.log("Final user record:", finalUserRecord);

      // Update local state
      const newUser = {
        ...finalUserRecord,
        id: finalUserRecord.id,
        cities: cityIds,
        communities: communityIds,
        cities_details: cityIds.map((id) => ({
          id,
          state: "Utah",
        })),
        communities_details: communityIds.map((id) => ({ id })),
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);

      // Update user select options
      setUserSelectOptions((prevOptions) => [
        ...prevOptions,
        {
          value: newUser.id,
          label: `${newUser.first_name} ${newUser.last_name}`,
          data: newUser,
        },
      ]);

      toast.success("User invited and created successfully");
      return { success: true, data: newUser };
    } catch (err) {
      console.error("Add user error:", err);
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Use the same invitation API endpoint
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend invitation");
      }

      const responseData = await response.json();

      toast.success(`Invitation resent successfully to ${userData.email}`);
      return { success: true, data: responseData };
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to resend invitation: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Editing user with ID:", userData.id);

      const formattedPermissions = {
        texting: userData.permissions?.texting === true,
        administrator: userData.permissions?.administrator === true,
        dos_admin: userData.permissions?.dos_admin === true,
        content_development: userData.permissions?.content_development === true,
        missionary_volunteer_management:
          userData.permissions?.missionary_volunteer_management === true,
        classes_admin: userData.permissions?.classes_admin === true,
      };

      // Ensure cities is an array of IDs
      let cityIds = [];
      if (Array.isArray(userData.cities)) {
        cityIds = userData.cities.map((c) => {
          // If c is an object with id property, extract id
          if (typeof c === "object" && c !== null && c.id) {
            return c.id;
          }
          // If c is already a string ID, use it
          return c;
        });
      }

      // Ensure communities is an array of IDs
      let communityIds = [];
      if (Array.isArray(userData.communities)) {
        communityIds = userData.communities.map((c) => {
          // If c is an object with id property, extract id
          if (typeof c === "object" && c !== null && c.id) {
            return c.id;
          }
          // If c is already a string ID, use it
          return c;
        });
      }

      // Update the user in the database
      const { data, error } = await supabase
        .from("users")
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          contact_number: userData.contact_number,
          permissions: formattedPermissions, // Use formatted permissions
          cities: cityIds, // Array of city IDs
          communities: communityIds, // Array of community IDs
        })
        .eq("id", userData.id) // Ensure this matches the database `id`
        .select() // Select the updated row
        .single(); // Ensure only one row is returned

      // If no rows are returned, throw an error
      if (!data) {
        throw new Error("No user found with the provided ID.");
      }

      if (error) throw error;

      // Fetch the updated user with full details from the view
      const { data: updatedUserWithDetails, error: fetchError } = await supabase
        .from("users_with_details")
        .select(
          `
          *,
          cities_details,
          communities_details
        `
        )
        .eq("id", userData.id)
        .single();

      if (fetchError) {
        console.error("Error fetching updated user details:", fetchError);
        throw fetchError;
      }

      // Update the local state with the fully detailed user data
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id !== userData.id) return u;

          return {
            ...updatedUserWithDetails,
            id: updatedUserWithDetails.id,
            cities: updatedUserWithDetails.cities_details || [],
            communities: updatedUserWithDetails.communities_details || [],
          };
        })
      );

      toast.success("User updated successfully");
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to delete user with ID:", userId);

      // Call the API to delete the user
      const response = await fetch("/api/auth/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      console.log("User deletion successful:", data);

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
      return { success: true };
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.message);
      toast.error(`Failed to delete user: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordReset = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent successfully");
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    hasLoaded,
    loading,
    error,
    userSelectOptions,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handlePasswordReset,
    handleResendInvitation, // New function added here
    initialUserState,
  };
};

export default useUsers;
