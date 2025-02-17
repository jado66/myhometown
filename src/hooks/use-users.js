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
      // Create invitation link for the user
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
        throw new Error(error.message || "Failed to send invitation");
      }

      const { data: inviteData } = await response.json();

      // Add or update the user profile data
      const { data, error: dbError } = await supabase
        .from("users")
        .upsert([
          {
            id: inviteData.user.id,
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

      if (dbError) throw dbError;

      setUsers((prevUsers) => [...prevUsers, { ...data, id: data.id }]);
      toast.success("User invited successfully");
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
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
          communities: userData.communities.map((c) => c.id), // Use the provided communities
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
        prevUsers.map((u) =>
          u.id === userData.id
            ? {
                ...data,
                id: data.id,
                cities: userData.cities,
                communities: userData.communities,
                cities_details: userData.cities.map((c) => {
                  return { ...c, state: "Utah" };
                }), // Use the provided cities
                communities_details: userData.communities,
              }
            : u
        )
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
      // First, delete from the users table
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (dbError) throw dbError;

      // Then, delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) throw authError;

      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
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
    initialUserState,
  };
};

export default useUsers;
