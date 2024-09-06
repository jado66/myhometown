import { useState } from "react";

export function useUploadFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToS3 = async (file) => {
    if (!file) {
      console.error("No file selected");
      return null;
    }

    if (
      !file.type.startsWith("video/") &&
      !file.type.startsWith("image/") &&
      file.type !== "application/pdf" &&
      file.type !== "image/webp"
    ) {
      console.error("Invalid file type");
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      console.log("Fetching presigned URL...");
      const response = await fetch("/api/database/media/s3/getPresignedUrl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          originalFilename: file.name,
        }),
      });

      if (response.ok) {
        console.log("Presigned URL fetched successfully");
        const { url, fields } = await response.json();

        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", file);

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setProgress(percentComplete);
            }
          };

          xhr.onload = () => {
            console.log(`XHR onload triggered. Status: ${xhr.status}`);
            if (xhr.status === 204) {
              // Use the key from the fields to construct the object URL
              const objectUrl = `${url}${fields.key}`;
              setUploading(false);
              setProgress(100);
              console.log("File uploaded successfully. URL:", objectUrl);
              resolve({ url: objectUrl });
            } else {
              console.error("Error uploading file. Status:", xhr.status);
              reject(new Error(`Error uploading file. Status: ${xhr.status}`));
            }
          };

          xhr.onerror = (error) => {
            console.error("XHR error:", error);
            reject(new Error("Error uploading file"));
          };

          console.log("Initiating file upload...");
          xhr.open("POST", url, true);
          xhr.send(formData);
        });
      } else {
        console.error("Failed to get pre-signed URL. Status:", response.status);
        throw new Error("Failed to get pre-signed URL.");
      }
    } catch (e) {
      console.error("Error in uploadToS3:", e.message);
      setUploading(false);
      setProgress(0);
      return null;
    }
  };

  return { uploadToS3, uploading, progress };
}
