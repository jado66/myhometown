import { useState } from "react";

export function useUploadFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Uploads a file to S3 via our server-side route.
   * Returns { url } on success, or null on failure (read `error` for details).
   * @param {File} file - The file to upload
   * @param {string} [folder] - Optional folder/prefix
   */
  const uploadToS3 = async (file, folder = "") => {
    setError(null);

    if (!file) {
      const e = new Error("No file selected");
      console.error(e.message);
      setError(e);
      return null;
    }

    if (
      !file.type.startsWith("video/") &&
      !file.type.startsWith("image/") &&
      file.type !== "application/pdf" &&
      file.type !== "image/webp"
    ) {
      const e = new Error(`Invalid file type: ${file.type}`);
      console.error(e.message);
      setError(e);
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) formData.append("folder", folder);

      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress((event.loaded / event.total) * 100);
          }
        };

        xhr.onload = () => {
          setUploading(false);
          let parsed = null;
          try {
            parsed = JSON.parse(xhr.responseText);
          } catch {
            // non-JSON response — fall through with parsed = null
          }

          if (xhr.status >= 200 && xhr.status < 300 && parsed?.url) {
            setProgress(100);
            resolve({ url: parsed.url });
          } else {
            const message =
              parsed?.error ||
              `Upload failed (status ${xhr.status})`;
            reject(new Error(message));
          }
        };

        xhr.onerror = () => {
          setUploading(false);
          reject(new Error("Network error during upload"));
        };

        xhr.open("POST", "/api/database/media/s3/upload", true);
        xhr.send(formData);
      });
    } catch (e) {
      console.error("Error in uploadToS3:", e.message);
      setUploading(false);
      setProgress(0);
      setError(e);
      // Return the error inline so callers don't have to wait for the
      // `error` state to flush across a re-render.
      return { error: e };
    }
  };

  return { uploadToS3, uploading, progress, error };
}
