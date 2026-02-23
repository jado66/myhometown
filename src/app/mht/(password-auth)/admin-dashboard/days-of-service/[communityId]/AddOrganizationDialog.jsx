"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
} from "@mui/material";

const AddOrganizationDialog = ({
  open,
  onClose,
  setCurrentStake,
  currentStake,
  handleSaveStake,
  handleDeleteStake,
  isSaving,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentStake?.id
          ? `Edit Organization: ${currentStake.name}`
          : "Add New Organization"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2} alignItems="stretch">
            {/* Left Column */}
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Organization Name"
                fullWidth
                value={currentStake?.name || ""}
                onChange={(e) =>
                  setCurrentStake({ ...currentStake, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Estimated Number of Projects"
                fullWidth
                type="number"
                value={currentStake?.number_of_projects || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    number_of_projects: e.target.value,
                  })
                }
                required
              />
            </Grid>

            <Divider sx={{ my: 2, width: "100%" }} />

            <Grid
              item
              xs={12}
              sm={0.4}
              sx={{ display: { sm: "none", xs: "block" } }}
            >
              <Divider
                flexItem
                sx={{
                  height: "100%",
                  bgcolor: "grey.400",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={5.8}>
              <TextField
                margin="dense"
                label="Liaison Name 1"
                fullWidth
                value={currentStake?.liaison_name_1 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_name_1: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Liaison Title 1"
                key="liaison_title_1"
                fullWidth
                value={currentStake?.partner_stake_liaison_title_1 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    partner_stake_liaison_title_1: e.target.value,
                  })
                }
              />

              <TextField
                margin="dense"
                label="Liaison Email 1"
                fullWidth
                value={currentStake?.liaison_email_1 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_email_1: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Liaison Phone 1"
                fullWidth
                value={currentStake?.liaison_phone_1 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_phone_1: e.target.value,
                  })
                }
              />
            </Grid>

            {/* Vertical Divider */}
            <Grid
              item
              xs={12}
              sm={0.4}
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: "100%",
                  bgcolor: "grey.400",
                  width: "1px",
                }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={0.4}
              sx={{ display: { sm: "none", xs: "block" } }}
            >
              <Divider
                flexItem
                sx={{
                  height: "100%",
                  bgcolor: "grey.400",
                }}
              />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} sm={5.8}>
              <TextField
                margin="dense"
                label="Liaison Name 2 (Optional)"
                fullWidth
                value={currentStake?.liaison_name_2 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_name_2: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Liaison Title 2 (Optional)"
                key="liaison_title_2"
                fullWidth
                value={currentStake?.partner_stake_liaison_title_2 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    partner_stake_liaison_title_2: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Liaison Email 2 (Optional)"
                fullWidth
                value={currentStake?.liaison_email_2 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_email_2: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Liaison Phone 2 (Optional)"
                fullWidth
                value={currentStake?.liaison_phone_2 || ""}
                onChange={(e) =>
                  setCurrentStake({
                    ...currentStake,
                    liaison_phone_2: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        {currentStake?.id && (
          <Button
            onClick={handleDeleteStake}
            color="error"
            variant="outlined"
            disabled={isSaving}
          >
            Delete Organization
          </Button>
        )}
        <Box sx={{ flex: "1 1 auto" }} />
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveStake}
          variant="contained"
          disabled={!currentStake?.name?.trim() || isSaving}
        >
          {currentStake?.id ? "Update" : "Add"} Organization
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrganizationDialog;
