"use client";
import { useEffect, useState, Fragment } from "react";
import Card from "@mui/material/Card";
import useUsers from "@/hooks/use-users";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import AddEditUserDialog from "@/components/data-tables/AddEditUserDialog";
import { DataTable } from "@/components/data-tables/DataTable";
import { createUserColumns } from "@/constants/columns";
import { Grid, Box, Typography } from "@mui/material";
import BackButton from "@/components/BackButton";
import Loading from "@/components/util/Loading";
import { NotResponsiveAlert } from "@/util/NotResponsiveAlert";

export default function Management() {
  const { users, handleAddUser, handleEditUser, handleDeleteUser, hasLoaded } =
    useUsers();

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
        handleDeleteUser(userId);
        setShowConfirmDeleteUser(false);
      },
      onCancel: () => setShowConfirmDeleteUser(false),
      onClose: () => setShowConfirmDeleteUser(false),
    });
    setShowConfirmDeleteUser(true);
  };

  const handleCloseUserForm = () => {
    setShowAddUserForm(false);
    setUserToEdit(null);
  };

  useEffect(() => {
    if (userToEdit) {
      setShowAddUserForm(true);
    }
  }, [userToEdit]);

  const userColumns = createUserColumns(handleAskDeleteUser, setUserToEdit);

  return (
    <Grid container item sm={12} display="flex" sx={{ position: "relative" }}>
      <BackButton />
      <NotResponsiveAlert sx={{ mt: 8 }} />

      <AskYesNoDialog
        {...confirmDeleteUserProps}
        open={showConfirmDeleteUser}
      />
      <AddEditUserDialog
        open={showAddUserForm}
        handleClose={handleCloseUserForm}
        onSubmitForm={handleEditUser}
        initialUserState={userToEdit}
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
            color={"primary"}
            align={"center"}
          >
            Admin User Management
          </Typography>
          <Box
            component={Typography}
            fontWeight={700}
            variant={"h3"}
            align={"center"}
            gutterBottom
          >
            Manage users and their roles
          </Box>
          <Typography
            variant={"h6"}
            component={"p"}
            color={"textSecondary"}
            align={"center"}
          >
            Here you can add, remove, or edit users and their roles.
          </Typography>
        </Box>
        {!hasLoaded ? (
          <Box display="flex" justifyContent="center">
            <Loading size={50} />
          </Box>
        ) : (
          <DataTable
            id="user"
            rows={users}
            columns={userColumns}
            hiddenColumns={["_id", "country", "cities", "communities"]}
          />
        )}
      </Card>
    </Grid>
  );
}
