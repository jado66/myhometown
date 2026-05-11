import { useState } from "react";
import { toast } from "react-toastify";

// Stay safely under Vercel's 4.5 MB serverless body limit.
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3 MB
const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

/**
 * Compresses an image file using the Canvas API if it exceeds MAX_UPLOAD_BYTES.
 * SVGs and GIFs are returned unchanged. Falls back to the original on any error.
 * Returns { file, wasCompressed }.
 */
function compressImage(file) {
  return new Promise((resolve) => {
    if (
      file.type === "image/svg+xml" ||
      file.type === "image/gif" ||
      file.size <= MAX_UPLOAD_BYTES
    ) {
      resolve({ file, wasCompressed: false });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, wasCompressed: false });
            return;
          }
          resolve({
            file: new File([blob], file.name, {
              type: outputType,
              lastModified: file.lastModified,
            }),
            wasCompressed: true,
          });
        },
        outputType,
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, wasCompressed: false }); // Fall back to original on error
    };

    img.src = objectUrl;
  });
}

export function useUploadFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Uploads a file to S3 via our server-side route.
   * Images larger than 3 MB are compressed client-side before uploading
   * to stay under Vercel's 4.5 MB serverless body limit.
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
      // Compress raster images that exceed the server body-size limit.
      const { file: fileToUpload, wasCompressed } = file.type.startsWith(
        "image/",
      )
        ? await compressImage(file)
        : { file, wasCompressed: false };

      if (wasCompressed) {
        toast.info("Image was resized to reduce file size before uploading.", {
          toastId: "image-compressed-before-upload",
        });
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
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
              parsed?.error || `Upload failed (status ${xhr.status})`;
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
