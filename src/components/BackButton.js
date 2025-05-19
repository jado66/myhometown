import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = ({
  href,
  text = "Back",
  top = "64px",
  onClick,
  fallbackHref, // Default fallback route
  ...props
}) => {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(true);

  useEffect(() => {
    // Check if there's history to go back to
    // This is a simple heuristic - if window.history.length <= 1,
    // it usually means the user came directly to this page
    const checkHistory = () => {
      if (typeof window !== "undefined") {
        setHasHistory(window.history.length > 2);
      }
    };

    checkHistory();
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (href) {
      router.push(href);
    } else if (hasHistory) {
      router.back();
    } else {
      // No history to go back to, use fallback
      router.push(fallbackHref);
    }
  };

  // Don't render the button if there's no history and no fallback
  if (!hasHistory && !href && !fallbackHref && !onClick) {
    return null;
  }

  return (
    <Button
      variant="standard"
      onClick={handleClick}
      sx={{
        marginBottom: "1rem",
        position: "absolute",
        top: top,
        left: 0,
        marginLeft: 6,
        marginTop: 2,
        textTransform: "capitalize",
      }}
      {...props}
    >
      <ArrowBackIcon mr={2} fontSize="small" />
      {text}
    </Button>
  );
};

export default BackButton;
