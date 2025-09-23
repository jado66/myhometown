import React from "react";
import {
  Grid,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const MarketingItemEdit = ({
  index = 1,
  marginTop = 0,
  content,
  handleMarketingHeaderChange,
  handleChangeMarketingImage,
  openImageDialog,
  UploadImage,
  communityData,
  onDelete,
  showDeleteButton = false,
  totalMarketingItems = 2, // Add this prop to track total count
}) => {
  const textFieldStyles = {
    fontFamily: "inherit",
    fontSize: "2rem",
    border: "none",
    margin: 0,
    padding: "10px 16px",
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
    "& .MuiInput-underline:before": {
      borderBottom: "none",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none",
    },
    "& .Mui-focused": {
      backgroundColor: "#f0f0f0",
      borderRadius: "4px",
    },
  };

  const headerKey = `marketingHeader${index === 1 ? "" : index}`;
  const imageKey = `marketingImage${index}`;

  // Show delete button if there are more than 2 total marketing items
  // Any item can be deleted as long as at least 2 remain
  const canShowDelete = totalMarketingItems > 2;

  const handleDelete = () => {
    if (totalMarketingItems <= 2) {
      // This shouldn't happen due to canShowDelete logic, but safety check
      return;
    }
    onDelete(index);
  };

  return (
    <Grid
      item
      xs={12}
      md={6}
      display="flex"
      flexDirection="column"
      position="relative"
    >
      {canShowDelete && (
        <Tooltip title={`Delete marketing item ${index}`}>
          <IconButton
            onClick={handleDelete}
            sx={{
              position: "absolute",
              top: { md: 0, xs: marginTop },
              right: 0,
              zIndex: 10,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              color: "error.main",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.9)",
                color: "error.dark",
              },
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <TextField
        variant="standard"
        value={content?.[headerKey] || "Your Flyer Title"}
        onChange={(event) => handleMarketingHeaderChange(event, headerKey)}
        multiline
        InputProps={{
          disableUnderline: true,
          style: {
            fontSize: "2rem",
            textAlign: "center",
            color: "#00357d",
            textTransform: "capitalize",
          },
        }}
        fullWidth
        sx={{
          ...textFieldStyles,
          mt: { md: 0, xs: marginTop },
        }}
      />
      <Box
        display="flex"
        justifyContent="center"
        position="relative"
        sx={{
          px: 1,
          display: "flex",
          width: "100%",
          backgroundColor: "transparent",
          flexGrow: index === 2 ? 1 : "unset",
          minHeight: index === 2 ? "100px" : "unset",
        }}
      >
        <UploadImage setUrl={(url) => handleChangeMarketingImage(url, index)} />
        {communityData.content?.[imageKey] ? (
          <Box
            component="img"
            src={communityData.content[imageKey]}
            sx={{
              width: "100%",
              height: "auto",
              flexGrow: 1,
              objectFit: "cover",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              borderRadius: 4,
              aspectRatio: "8 / 11",
            }}
            onClick={() =>
              openImageDialog &&
              openImageDialog(communityData.content[imageKey])
            }
          />
        ) : (
          <Typography variant="h4" component="h2" align="center">
            Marketing Image {index}
          </Typography>
        )}
      </Box>
    </Grid>
  );
};

export default MarketingItemEdit;
