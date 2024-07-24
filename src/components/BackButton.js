import React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
const BackButton = ({ href, text = "Back", ...props }) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="standard"
      onClick={handleClick}
      sx={{
        marginBottom: "1rem",
        position: "absolute",
        top: "64px",
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
