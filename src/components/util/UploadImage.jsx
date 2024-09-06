"use client";
import React, { useState, useRef } from "react";
import { Grid, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { useUploadFile } from "@/hooks/use-upload-file";
import { AddPhotoAlternateTwoTone, Delete } from "@mui/icons-material";
import Loading from "./Loading";
import { toast } from "react-toastify";
import { useImageUpload } from "@/hooks/use-upload-image";

function UploadImage({ setUrl, onRemove, alwaysShow, right }) {
  //right is needed is some cases
  const fileInput = useRef();

  const { handleFileUpload, loading, error, isVisible, setIsVisible } =
    useImageUpload(setUrl);

  const handleClick = (event) => {
    event.nativeEvent.stopImmediatePropagation();
    event.stopPropagation();
    fileInput.current.click();
  };

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "absolute",
        zIndex: 2,
        width: "100%",
        height: "100%",
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <input
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        ref={fileInput}
        multiple={false}
        accept="image/*"
      />
      {!loading ? (
        <>
          {onRemove && (
            <IconButton
              sx={{
                position: "absolute",
                top: "0%",
                left: "0%",
                color: "black",
                backgroundColor: "lightgrey",
                margin: "0.5em",
                opacity: isVisible || alwaysShow ? 1 : 0,
                transition: "visibility 0.05s, opacity 0.5s linear",
                "&:hover": {
                  backgroundColor: "white",
                },
              }}
              onClick={onRemove}
            >
              <Delete fontSize="12px" />
            </IconButton>
          )}
          <IconButton
            sx={{
              position: "absolute",
              top: "0%",
              right: right || "0%",
              color: "black",
              backgroundColor: "lightgrey",
              margin: "0.5em",
              opacity: isVisible ? 1 : 0,
              transition: "visibility 0.05s, opacity 0.5s linear",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
            onClick={handleClick}
          >
            <AddPhotoAlternateTwoTone fontSize="12px" />
          </IconButton>
        </>
      ) : (
        <IconButton
          sx={{
            position: "absolute",
            top: "0%",
            right: "0%",
            color: "black",
            backgroundColor: "lightgrey",
            margin: "0.5em",
            "&:hover": {
              backgroundColor: "white",
            },
          }}
        >
          <Loading size={25} />
        </IconButton>
      )}

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </Grid>
  );
}

export default UploadImage;
