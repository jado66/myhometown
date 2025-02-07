import { Button, Grid, Typography, Divider, TextField } from "@mui/material";
import { IconSelect } from "./IconSelect";
import { useState } from "react";

export const CreateCategoryForm = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("None");

  const MAX_TITLE_LENGTH = 50;

  const isFormValid = () => {
    return title.length > 0 && title.length <= MAX_TITLE_LENGTH;
  };

  return (
    <>
      <Divider />
      <Grid
        container
        item
        xs={12}
        display="flex"
        flexDirection="row"
        spacing={1}
        sx={{ px: 2, py: 2 }}
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" textAlign="center">
            Add New Category
          </Typography>
        </Grid>
        <Grid
          container
          xs={12}
          display="flex"
          flexDirection="row"
          spacing={1}
          sx={{ px: 2 }}
          alignItems="center"
        >
          <Grid item xs={3} sm={2}>
            <IconSelect
              onSelect={(e) => setIcon(e.target.value)}
              icon={icon}
              height={40}
            />
          </Grid>
          <Grid item xs={9} sm={4}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Category Title"
              onChange={(e) => {
                setTitle(e.target.value);
                e.stopPropagation();
              }}
              margin="normal"
              InputProps={{
                style: { height: "47px" },
              }}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" flexDirection="row">
          <Grid item xs={4} sm={8} />
          <Grid item xs={4} sm={2}>
            <Button onClick={onClose}>Cancel</Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onCreate(icon, title);
                setTitle(""); // Reset after adding
                onClose();
              }}
              disabled={!isFormValid()}
            >
              Add Category
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
