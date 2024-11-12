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
      const res = await fetch("/api/database/users");
      const data = await res.json();
      setUsers(data.map((u) => ({ ...u, id: u._id })));

      const selectOptions = data.map((user) => ({
        value: user._id,
        label: `${user.firstName} ${user.lastName}`,
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
      const response = await fetch("/api/database/users/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setUsers((prevUsers) => [...prevUsers, { ...data, id: data._id }]);
      toast.success("User created successfully");
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
      const response = await fetch("/api/database/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userData._id ? { ...userData, id: userData._id } : u
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
      const response = await fetch(`/api/database/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }

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
      const response = await fetch(`/api/database/users/${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send password reset");
      }

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
