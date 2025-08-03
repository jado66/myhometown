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
    administrator: false,
    cityManagement: false,
    communityManagement: false,
    texting: false,
    classManagement: false,
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

      const formattedUsers = data.map((user) => ({
        ...user,
        id: user.id,

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
              cities: userData.cities?.map((c) => c.id) || [],
              communities: userData.communities?.map((c) => c.id) || [],
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
                cities: userData.cities?.map((c) => c.id) || [],
                communities: userData.communities?.map((c) => c.id) || [],
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
        cities: userData.cities || [],
        communities: userData.communities || [],
        cities_details: (userData.cities || []).map((c) => ({
          ...c,
          state: "Utah",
        })),
        communities_details: userData.communities || [],
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

      // Format the permissions object to ensure boolean values
      const formattedPermissions = {
        texting: userData.permissions?.texting === true,
        administrator: userData.permissions?.administrator === true,
        dos_admin: userData.permissions?.dos_admin === true,
      };

      // Update the user in the database
      const { data, error } = await supabase
        .from("users")
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          contact_number: userData.contact_number,
          permissions: formattedPermissions, // Use formatted permissions
          cities: userData.cities.map((c) => c.id), // Use the provided cities
          communities: userData.communities, // Now an array of IDs
        })
        .eq("id", userData.id) // Ensure this matches the database `id`
        .select() // Select the updated row
        .single(); // Ensure only one row is returned

      // If no rows are returned, throw an error
      if (!data) {
        throw new Error("No user found with the provided ID.");
      }

      if (error) throw error;

      // Update the local state with the updated user data
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id !== userData.id) return u;
          // Find the full community objects for the selected IDs
          let allCommunityDetails = u.communities_details || [];
          // If the user had no previous details, fallback to array of IDs
          let newCommunitiesDetails = Array.isArray(allCommunityDetails)
            ? allCommunityDetails.filter((comm) => userData.communities.includes(comm.id))
            : [];
          // If we have fewer than selected, fallback to IDs as objects
          if (newCommunitiesDetails.length !== userData.communities.length) {
            // Add any missing as {id: id}
            const missing = userData.communities.filter(
              (id) => !newCommunitiesDetails.some((c) => c.id === id)
            ).map((id) => ({ id }));
            newCommunitiesDetails = [...newCommunitiesDetails, ...missing];
          }
          return {
            ...data,
            id: data.id,
            cities: userData.cities,
            communities: userData.communities,
            cities_details: userData.cities.map((c) => ({ ...c, state: "Utah" })),
            communities_details: newCommunitiesDetails,
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
