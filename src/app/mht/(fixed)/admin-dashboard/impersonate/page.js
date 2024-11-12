"use client";
import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "@/hooks/use-user";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import UserSelect from "@/components/data-tables/selects/UserSelect";

const ImpersonateUser = () => {
  const [newUser, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { impersonateUser, user } = useUser();

  const handleSubmit = async (e) => {
    setLoading(true);

    if (!newUser) {
      toast.error("Please select a user to impersonate");
      setLoading(false);
      return;
    }
    await impersonateUser(newUser?.value, newUser?.sub);
    e.preventDefault();
    setLoading(false);
  };

  return (
    <Grid container justifyContent="center" style={{ marginY: "20px" }}>
      <Grid item xs={12} sm={8} md={6} sx={{ my: 3 }}>
        <Card>
          <CardContent>
            <Typography
              variant="h5"
              component="div"
              gutterBottom
              textAlign="center"
            >
              Current user
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
              loading={loading}
              sx={{ mt: 3 }}
            >
              Submit
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ImpersonateUser;
