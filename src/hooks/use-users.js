import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';

export default function useUsers() {
    const [users, setUsers] = useState([]);
    const [selectOptions, setSelectOptions] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        // Fetch users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users'));
        if (storedUsers) {
            setUsers(storedUsers);
        }
        else {
            setUsers(mockUsers);
            localStorage.setItem('users', JSON.stringify(mockUsers));

        }

        setHasLoaded(true);
    }, []);

    useEffect(() => {
        // Save users to localStorage
        if (hasLoaded) {
            localStorage.setItem('users', JSON.stringify(users));
        }

        const newSelectOptions = users.map((user) => ({
            value: user.id,
            label: user.name,
            data: user,
        }));

        setSelectOptions(newSelectOptions);

    }, [users]);

    const handleAddUser = (user) => {
        setUsers([...users, user]);
    };

    const handleEditUser = (id, user) => {
        setUsers(users.map((u) => (u.id === id ? user : u)));
    };

    const handleDeleteUser = (id) => {
        setUsers(users.filter((u) => u.id !== id));
    };

    return {
        users,
        hasLoaded,
        selectOptions,
        handleAddUser,
        handleEditUser,
        handleDeleteUser,
    };
}

const mockUsers = [
    {
        id: 1,
        name: 'JD Erwin',
        email: 'JD@japps.dev',
        contactNumber: '801-254-8871',
        role: 'Admin',
    },
    {
        id: 2,
        name: 'Jerry Craven',
        email: 'jerry.craven@gmail.com',
        contactNumber: '123-456-7890',
        role: 'Admin',
    },
    ...Array.from({length: 35}, (_, id) => ({
        id: id + 3,
        name: faker.person.fullName(),	// generates random name
        email: faker.internet.email(),	// generates random email
        contactNumber: faker.phone.number(),	// generates random phone number
        role: ['Admin', 'Community Owner', 'City Owner'][Math.floor(Math.random() * 3)]
    }))
];

