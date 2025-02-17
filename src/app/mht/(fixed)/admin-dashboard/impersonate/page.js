"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/use-user";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import UserSelect from "@/components/data-tables/selects/UserSelect";
import { Divider } from "@mui/material";

const ImpersonateUser = () => {
  const [newUser, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { impersonateUser, user, isImpersonating, stopImpersonation } =
    useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newUser) {
      toast.error("Please select a user to impersonate");
      setLoading(false);
      return;
    }

    await impersonateUser(newUser?.value, newUser?.sub);
    toast.success("Successfully impersonating user");
    setLoading(false);
  };

  const handleStopImpersonation = async () => {
    setLoading(true);
    await stopImpersonation();
    setUser(null);
    toast.success("Stopped impersonating user");
    setLoading(false);
  };

  return (
    <Grid
      container
      justifyContent="center"
      style={{
        marginY: "20px",
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid item xs={12} sm={8} md={6} sx={{ my: 3 }}>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          textAlign="center"
        >
          Current user: {user?.email}
        </Typography>

        <Typography
          variant="h5"
          component="div"
          gutterBottom
          textAlign="center"
        >
          Impersonate User
        </Typography>

        <UserSelect
          value={newUser}
          onChange={(value) => setUser(value)}
          defaultValue={user}
          isMulti={false}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={loading || !newUser}
          sx={{ mt: 3 }}
        >
          {isImpersonating ? "Impersonate " : "Start Impersonating"}{" "}
          {newUser?.label}
        </Button>

        <Divider sx={{ my: 3 }} />

        {isImpersonating && (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleStopImpersonation}
          >
            Stop Impersonating User
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export default ImpersonateUser;
