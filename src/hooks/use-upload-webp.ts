"use client";

// hooks/use-image-upload.ts
import { useState } from "react";
import { useUploadFile } from "@/hooks/use-upload-file"; // Assuming this hook exists
import { toast } from "react-toastify"; // Assuming react-toastify is used for toasts

export const useImageUpload = (setUrl: (url: string) => void) => {
  // Accept folder argument for profile pictures
  // Only use uploading and progress from useUploadFile
  const { uploadToS3, uploading, progress } = useUploadFile();

  // Optionally set a folder for profile pictures
  const PROFILE_PICTURE_FOLDER = "profile-pictures";
  const [isVisible, setIsVisible] = useState(false); // This state seems unrelated to the core upload logic, keeping it as is.

  // Modified to accept a File or Blob directly
  /**
   * Uploads a processed image to S3, optionally into the profile-pictures folder.
   * Maintains backwards compatibility: if file has a folder property, use it, else default to profile-pictures.
   */
  /**
   * Uploads a processed image to S3, optionally into the profile-pictures folder.
   * Maintains backwards compatibility: if file has a folder property, use it, else default to profile-pictures.
   * Only accepts File (not Blob) for S3 upload.
   */
  const uploadProcessedImage = async (file: File, folder?: string) => {
    if (!file) {
      console.log("No file provided for upload.");
      return;
    }

    // Use folder if provided, else default to profile-pictures
    const targetFolder = folder || PROFILE_PICTURE_FOLDER;
    const result = await uploadToS3(file, targetFolder);

    if (result) {
      console.log("Successfully uploaded file.");
      toast.success(
        "Image uploaded successfully. Make sure to save your changes.",
        {
          toastId: "image-uploaded-successfully",
        }
      );
      setUrl(result.url);
    } else {
      console.error("File upload failed.");
      toast.error("Failed to upload image. Please try again.");
    }
  };

  return {
    uploadProcessedImage, // Renamed for clarity
    uploading,
    progress,
    isVisible,
    setIsVisible,
  };
};
