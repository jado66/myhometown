import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useUsers() {
    const [users, setUsers] = useState([]);
    const [userSelectOptions, setUserSelectOptions] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
  
    useEffect(() => {
        async function fetchUsers() {
            try {
            const res = await fetch('/api/database/users');
            const data = await res.json();
            setUsers(data.map((u) => ({ ...u, id: u._id })));

            const selectOptions = data.map((user) => ({ value: user._id, label: user.name, data: user }));
            setUserSelectOptions(selectOptions);
            
            } catch (e) {
            console.error('Error occurred while fetching users', e);
            }
            
            setHasLoaded(true);
        }

        fetchUsers();
      
    }, []);
  
    // const handleAddUser = async (user) => {
    //   try {
    //     const res = await fetch('/api/database/users', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(user)
    //     });
        
    //     const newUser = await res.json();
    //     setUsers([...users, newUser]);
        
    //   } catch (e) {
    //     console.error('Error occurred while adding a user', e);
    //   }
    // };
  
    const handleEditUser = async (user) => {
      try {
        const res = await fetch(`/api/database/users`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user
          })
        });
  
        const updatedUser = await res.json();
        setUsers(prevUsers => prevUsers.map((u) => u._id === user._id ? user : u));
        toast.success('User updated successfully');

      } catch (e) {
        console.error('Error occurred while editing a user', e);
      }
    };
  
    const handleDeleteUser = async (id) => {
      try {
        await fetch(`/api/database/users/${id}`, {
          method: 'DELETE'
        });
  
        setUsers(users.filter((u) => u.id !== id));
        
      } catch (e) {
        console.error('Error occurred while deleting a user', e);
      }
    };
  
    return {
      users,
      hasLoaded,
      userSelectOptions,
      handleEditUser,
      handleDeleteUser,
    };
  }