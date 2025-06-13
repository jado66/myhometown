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
            id: inviteData.user?.id, // Handle case where user might not be returned
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

      setUsers((prevUsers) => [
        ...prevUsers,
        {
          ...data,
          id: data.id,
          cities: userData.cities,
          communities: userData.communities,
          cities_details: userData.cities.map((c) => {
            return { ...c, state: "Utah" };
          }), // Use the provided cities
          communities_details: userData.communities,
        },
      ]);

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
      console.log("Attempting to delete user with ID:", userId);

      // Step 1: Check if user exists in auth system first
      let authUserExists = false;
      try {
        const { data: authUser, error: getUserError } =
          await supabase.auth.admin.getUserById(userId);
        if (authUser && !getUserError) {
          authUserExists = true;
          console.log("Auth user found:", authUser.user?.email);
        }
      } catch (error) {
        console.log("Auth user not found or error checking:", error.message);
      }

      // Step 2: Delete from auth system first (if exists)
      if (authUserExists) {
        console.log("Deleting from auth system...");
        const { error: authError } = await supabase.auth.admin.deleteUser(
          userId
        );

        if (authError) {
          console.error("Auth deletion error:", authError);
          // Don't throw immediately - we might still want to clean up the database record
          console.log(
            "Auth deletion failed, but continuing with database cleanup..."
          );
        } else {
          console.log("Successfully deleted from auth system");
        }
      }

      // Step 3: Delete related invitation records first (if using custom invitation system)
      try {
        // Get user email first for invitation cleanup
        const { data: userData } = await supabase
          .from("users")
          .select("email")
          .eq("id", userId)
          .single();

        if (userData?.email) {
          console.log("Cleaning up invitation records for:", userData.email);
          const { error: inviteError } = await supabase
            .from("user_invitations")
            .delete()
            .eq("email", userData.email);

          if (inviteError) {
            console.warn(
              "Failed to delete invitation records:",
              inviteError.message
            );
            // Don't throw - this is not critical
          }
        }
      } catch (error) {
        console.warn("Error during invitation cleanup:", error.message);
        // Continue with deletion
      }

      // Step 4: Delete from users table
      console.log("Deleting from users table...");
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw new Error(
          `Failed to delete user from database: ${dbError.message}`
        );
      }

      console.log("Successfully deleted from users table");

      // Step 5: Update local state
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
