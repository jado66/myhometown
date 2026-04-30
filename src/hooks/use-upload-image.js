import { useState } from "react";
import { useUploadFile } from "@/hooks/use-upload-file";
import { toast } from "react-toastify";

export const useImageUpload = (setUrl) => {
  const { uploadToS3, uploading, error } = useUploadFile();
  const [isVisible, setIsVisible] = useState(false);

  const handleFileUpload = async (event) => {
    event.stopPropagation();

    if (!event.target.files || event.target.files.length === 0) {
      console.log("No file selected.");
      return;
    }

    const file = event.target.files[0];
    const result = await uploadToS3(file);

    if (result?.url) {
      toast.success(
        "Image uploaded successfully. Make sure to save your changes.",
        { toastId: "image-uploaded-successfully" },
      );
      setUrl(result.url);
    } else {
      const message = result?.error?.message || "Image upload failed";
      toast.error(message);
    }
  };

  return {
    handleFileUpload,
    loading: uploading,
    error,
    isVisible,
    setIsVisible,
  };
};
