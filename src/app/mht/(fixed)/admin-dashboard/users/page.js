"use client";
import React, { useState } from "react";
import { Grid, Box, Typography, Card } from "@mui/material";
import useUsers from "@/hooks/use-users";
import { UserFormDialog } from "@/components/data-tables/UserFormDialog";
import UserDataTable from "@/components/data-tables/UserDataTable";
import Loading from "@/components/util/Loading";
import BackButton from "@/components/BackButton";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";

export default function Management() {
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
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BackButton />
      {/* <NotResponsiveAlert sx={{ mt: 8 }} /> */}

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
        description={`Are you sure you want to delete ${userToDelete?.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        onClose={() => setShowConfirmDelete(false)}
      />

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
      </Card>
    </Grid>
  );
}
