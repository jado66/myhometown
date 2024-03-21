
'use client'
import { useEffect, useState, Fragment } from 'react';
import Card from '@mui/material/Card';
import useUsers from '@/hooks/use-users';
import AskYesNoDialog from '@/components/util/AskYesNoDialog';
import AddEditUserDialog from '@/components/data-tables/AddEditUserDialog';
import { DataTable } from '@/components/data-tables/DataTable';
import { createUserColumns } from '@/constants/columns';
import { Grid } from '@mui/material';
import BackButton from '@/components/BackButton';

export default function Management() {
    const { users, handleAddUser, handleEditUser, handleDeleteUser } = useUsers();

    const [userToEdit, setUserToEdit] = useState(null);

    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showConfirmDeleteUser, setShowConfirmDeleteUser] = useState(false);
    const [confirmDeleteUserProps, setConfirmDeleteUserProps] = useState({});

    const handleAskDeleteUser = (userId) => {
        
        const user = users.find((c) => c.id === userId);
        
        setConfirmDeleteUserProps({
            title: "Delete User",
            description: `Are you sure you want to delete ${user.name}?`,
            onConfirm: () => {
                handleDeleteUser(userId)
                setShowConfirmDeleteUser(false);
            },
            onCancel: () => setShowConfirmDeleteUser(false),
            onClose: () => setShowConfirmDeleteUser(false),
        });
        setShowConfirmDeleteUser(true);
    }

    const handleCloseUserForm = () => {
        setShowAddUserForm(false);
        setUserToEdit(null);
    }

    useEffect(() => {
        if (userToEdit) {
            setShowAddUserForm(true);
        }
    }, [userToEdit]);

    const userColumns = createUserColumns(handleAskDeleteUser, setUserToEdit);

    return (
        
        <Grid container item sm = {12} display = 'flex' sx = {{height:"100%", position:'relative'}}>

            <BackButton />

            <AskYesNoDialog 
                {...confirmDeleteUserProps}
                open={showConfirmDeleteUser}
            />
            <AddEditUserDialog
                open={showAddUserForm}
                handleClose={handleCloseUserForm}
                onSubmitForm={userToEdit? handleEditUser : handleAddUser}
                initialUserState = {userToEdit}
            />
        
            <Card sx={{width: '100%', height:'100%', m:3, p: 3, display:'flex', flexDirection:'column'}} >
                <h1>User Management</h1>

                <DataTable
                    id = "user"
                    rows={users}
                    columns={userColumns}
                    hiddenColumns = {['id', 'country']}
                />
                  
            </Card>
        </Grid>
    );
}
