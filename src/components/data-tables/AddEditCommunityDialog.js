import {
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Tooltip,
  Box,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import UserSelect from "./selects/UserSelect";
import StateSelect from "./StateSelect";
import { toast } from "react-toastify";
import CommunitySelect from "./selects/CommunitySelect";
import { WarningRounded } from "@mui/icons-material";

const initialState = {
  name: "",
  city: null,
  upcomingEvents: [],
  coordinates: {},
  boundingShape: [],
  communityOwners: [],
};

const AddEditCommunityDialog = ({
  open,
  handleClose,
  onSubmitForm,
  initialCommunityState,
}) => {
  const [community, setCommunity] = useState(
    initialCommunityState || initialState
  );

  useEffect(() => {
    if (open) {
      setCommunity(initialCommunityState || initialState);
    }
  }, [open, initialCommunityState]);

  const validateForm = () => {
    // community can't be empty and cant have special characters
    if (!community.name) {
      toast.error("Community name can't be empty");
      return false;
    }

    if (!community.name.match(/^[a-zA-Z\s]*$/)) {
      toast.error("Community name can't have special characters");
      return false;
    }

    if (community.name !== community.name.trim()) {
      toast.error("Community name can't have leading or trailing spaces");
      return false;
    }

    // // Community must have a Community Admin
    // if (community.communityOwners.length === 0) {
    //     toast.error("Community must have at least one owner");
    //     return false;
    // }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (initialCommunityState) {
      onSubmitForm(community);
      setCommunity(initialState);
      handleClose();
      return;
    }

    onSubmitForm(community);
    setCommunity(initialState);
    handleClose();
  };

  const handleUserSelectChange = (selectedUsers) => {
    setCommunity({
      ...community,
      communityOwners: selectedUsers.map((user) => user.data),
    });
  };

  const handleCommunitySelectChange = (selectedCommunities) => {
    setCommunity({
      ...community,
      communities: selectedCommunities.map((community) => community.data),
    });
  };

  const title = initialCommunityState
    ? "Edit Community Details"
    : "Add Community Details";

  const href =
    initialCommunityState && initialCommunityState.city
      ? `/${initialCommunityState.city.state
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${initialCommunityState.city.name
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${initialCommunityState.name
          .toLowerCase()
          .replaceAll(/\s/g, "-")}`
      : "";

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            autoFocus
            margin="dense"
            id="name"
            label="Community Name"
            type="text"
            fullWidth
            value={community.name}
            onChange={(e) =>
              setCommunity({ ...community, name: e.target.value })
            }
          />

          <TextField
            sx={{ mt: 1 }}
            autoFocus
            margin="dense"
            id="name"
            label="City"
            type="text"
            fullWidth
            value={community.city?.name || " Not Connected to a City"}
            disabled
            InputProps={{
              startAdornment: (
                <Tooltip
                  title="Cities are managed in the City Management Page."
                  arrow
                >
                  <WarningRounded />
                </Tooltip>
              ),
            }}
          />
          {/* <TextField
                        disabled
                        sx = {{mt:1}}
                        margin="dense"
                        id="country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={community.country}
                        onChange={(e) => setCommunity({ ...community, country: e.target.value })}
                    /> */}

          <FormControl fullWidth sx={{ mt: -1, mb: 3 }}>
            <InputLabel>Community Admins</InputLabel>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 1.5 }}>
            <UserSelect
              label="Community Admins"
              value={
                community.communityOwners.length > 0
                  ? community.communityOwners.map((user) => ({
                      value: user._id,
                      label: user.name,
                      data: user,
                    }))
                  : []
              }
              onChange={handleUserSelectChange}
            />
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            {initialCommunityState && community.city && (
              <>
                <Button onClick={handleClose} color="primary" href={href}>
                  View Page
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  href={`/edit/${community.city.state.toLowerCase()}/${community.city.name.toLowerCase()}/${community.name
                    .toLowerCase()
                    .replaceAll(/\s/g, "-")}`}
                >
                  Edit Landing Page
                </Button>
              </>
            )}
          </Box>
          <Box>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {initialCommunityState ? "Save" : "Add"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditCommunityDialog;
