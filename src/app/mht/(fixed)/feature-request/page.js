"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Container,
} from "@mui/material";
import { supabase } from "@/util/supabase";
import { useUser } from "@/hooks/use-user";
import JsonViewer from "@/components/util/debug/DebugOutput";

export default function FeatureRequestForm() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = null;
      if (image) {
        const { data, error } = await supabase.storage
          .from("user_uploads")
          .upload(
            `feature_requests/${user?.id || "guest"}/${Date.now()}-${
              image.name
            }`,
            image
          );

        if (error) throw error;
        imageUrl = data.path;
      }

      const { error } = await supabase.from("feature_requests").insert({
        user_id: user?.id,
        title,
        description,
        phone_number: user?.contactNumber,
        user_name: user?.firstName + " " + user?.lastName,
        image_url: imageUrl,
      });

      if (error) throw error;

      router.push("/thank-you");
    } catch (error) {
      console.error("Error submitting feature request:", error);
      alert("Failed to submit feature request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mt: 4,
          mb: 2,
          fontWeight: "medium",
        }}
      >
        Submit a Feature Request
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="label"
            htmlFor="title"
            sx={{
              display: "block",
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.secondary",
            }}
          >
            Title
          </Typography>
          <TextField
            id="title"
            fullWidth
            size="medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        <Box>
          <Typography
            component="label"
            htmlFor="description"
            sx={{
              display: "block",
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.secondary",
            }}
          >
            Description
          </Typography>
          <TextField
            id="description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        <Box>
          <Typography
            component="label"
            htmlFor="image"
            sx={{
              display: "block",
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: "medium",
              color: "text.secondary",
            }}
          >
            Image (optional)
          </Typography>
          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 1,
              position: "relative",
            }}
          >
            Upload Image
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              style={{
                clip: "rect(0 0 0 0)",
                clipPath: "inset(50%)",
                height: 1,
                overflow: "hidden",
                position: "absolute",
                bottom: 0,
                left: 0,
                whiteSpace: "nowrap",
                width: 1,
              }}
            />
          </Button>
          {image && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
              }}
            >
              Selected file: {image.name}
            </Typography>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            mt: 2,
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {submitting ? (
            <>
              <CircularProgress
                size={20}
                sx={{
                  mr: 1,
                  color: "inherit",
                }}
              />
              Submitting...
            </>
          ) : (
            "Submit Feature Request"
          )}
        </Button>
      </Box>
    </Container>
  );
}
