"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Grid, Box, Typography, Card } from "@mui/material";
import { UserFormDialog } from "@/components/data-tables/UserFormDialog";
import UserDataTable from "@/components/data-tables/UserDataTable";
import Loading from "@/components/util/Loading";
import BackButton from "@/components/BackButton";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import useUsers from "@/hooks/use-users";
// Dynamically import the components that need browser APIs
const DynamicManagementContent = dynamic(
  () => Promise.resolve(ManagementContent),
  {
    ssr: false,
    loading: () => (
      <Box display="flex" justifyContent="center">
        <Loading size={50} />
      </Box>
    ),
  }
);

export default function Management() {
  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BackButton />
      <Card
        sx={{
          width: "100%",
          height: "100%",
          m: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <Box marginBottom={4}>
          <Typography
            sx={{
              textTransform: "uppercase",
              fontWeight: "medium",
            }}
            gutterBottom
            color="primary"
            align="center"
          >
            Admin User Management
          </Typography>
          <Box
            component={Typography}
            fontWeight={700}
            variant="h3"
            align="center"
            gutterBottom
          >
            Manage users and their roles
          </Box>
          <Typography
            variant="h6"
            component="p"
            color="textSecondary"
            align="center"
          >
            Here you can add, remove, or edit users and their roles.
          </Typography>
        </Box>

        <DynamicManagementContent />
      </Card>
    </Grid>
  );
}

// Content component that uses browser APIs
function ManagementContent() {
  const {
    users,
    hasLoaded,
    loading,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handlePasswordReset,
    initialUserState,
  } = useUsers();

  const [showUserForm, setShowUserForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setUserToEdit(null);
  };

  const handleSubmitUser = async (userData) => {
    const result = await (userToEdit
      ? handleEditUser(userData)
      : handleAddUser(userData));

    if (result.success) {
      handleCloseUserForm();
    }
  };

  const handleAskDeleteUser = (user) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const result = await handleDeleteUser(userToDelete._id);
    if (result.success) {
      setShowConfirmDelete(false);
      setUserToDelete(null);
      handleCloseUserForm();
    }
  };

  return (
    <>
      <UserFormDialog
        open={showUserForm}
        onClose={handleCloseUserForm}
        onSubmit={handleSubmitUser}
        initialData={userToEdit || initialUserState}
        onDelete={handleAskDeleteUser}
        onPasswordReset={handlePasswordReset}
        loading={loading}
      />

      <AskYesNoDialog
        open={showConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.email}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        onClose={() => setShowConfirmDelete(false)}
      />

      {!hasLoaded ? (
        <Box display="flex" justifyContent="center">
          <Loading size={50} />
        </Box>
      ) : (
        <UserDataTable
          id="user"
          data={users}
          onRowClick={(user) => {
            setUserToEdit(user);
            setShowUserForm(true);
          }}
          onAddClick={() => {
            setUserToEdit(null);
            setShowUserForm(true);
          }}
        />
      )}
    </>
  );
}
