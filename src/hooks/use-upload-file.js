import { useState } from 'react';

export function useUploadFile() {
  const [uploading, setUploading] = useState(false)

  const uploadToS3 = async (file) => {

    if (!file) {
      alert('Please select a file to upload.')
      return
    }

    setUploading(true)

    try {
      // Fetch pre-signed URL from the Backend
      const response = await fetch('/api/database/media/s3/getPresignedUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })

      if (response.ok) {
        const { url: presignedUrl, fields } = await response.json()

        const bucket = new URL(presignedUrl).hostname.split('.')[0];


        // Upload the file to S3
        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value)
        })
        formData.append('file', file)

        const uploadResponse = await fetch(presignedUrl, {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const objectUrl = `https://${bucket}.s3.us-west-1.amazonaws.com/${fields.key}`;

          return { url: objectUrl }
        } else {
          throw new Error('Error uploading file')
        }
      } else {
        alert('Failed to get pre-signed URL.')
      }
    } catch (e) {
      console.error(e.message)
      alert(e.message)
    } finally {
      setUploading(false)
    }
  }

  return { uploadToS3, uploading };
}
