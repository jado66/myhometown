import { useState } from "react";
import { useUploadFile } from "@/hooks/use-upload-file";
import { toast } from "react-toastify";

export const useImageUpload = (setUrl) => {
  const { uploadToS3, loading, error } = useUploadFile();
  const [isVisible, setIsVisible] = useState(false);

  const handleFileUpload = async (event) => {
    event.stopPropagation();

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const result = await uploadToS3(file);

      if (result) {
        console.log("Successfully uploaded file.");
        toast.success(
          "Image uploaded successfully. Make sure to save your changes.",
          {
            toastId: "image-uploaded-successfully", // Your unique ID for the toast
          }
        );
        setUrl(result.url);
      }
    } else {
      console.log("No file selected.");
    }
  };

  return {
    handleFileUpload,
    loading,
    error,
    isVisible,
    setIsVisible,
  };
};
