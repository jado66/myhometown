import { ExpandLess } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Fade,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import StyledTextField from "./MyHometown/PageComponents/StyledTextField";

export const ImageAccordion = ({
  isEdit,
  title,
  editTitle,
  content,
  editContent,
  bgColor,
  contentColor = "black",
  right,
  cornerIcon,
  rounded,
}) => {
  const theme = useTheme();

  return (
    <AccordionStyled
      square
      elevation={0}
      sx={{
        backgroundColor: bgColor || "#F1B42D",
        right: right ? 0 : "",
        borderRadius: rounded ? 3 : 0,
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
      }}
      slotProps={{ transition: { timeout: 400 } }}
      slots={{ transition: Fade }}
    >
      <AccordionSummary
        aria-controls="panel1a-content"
        id="panel1a-header"
        expandIcon={
          <ExpandLess style={{ fontWeight: "bold", color: contentColor }} />
        }
      >
        <AccordionTitle
          variant="h6"
          textAlign="center"
          sx={{
            color: contentColor,
            fontSize: { xs: "1rem", md: "auto" },
          }}
          onClick={isEdit ? (e) => e.stopPropagation() : undefined}
        >
          {isEdit ? (
            <StyledTextField
              variant="outlined"
              sx={{
                color: "black",
                fontSize: "larger",
                mt: "auto",
                mb: "auto",
              }}
              value={title}
              onClick={(e) => e.stopPropagation()}
              onChange={(newText) => editTitle(newText)}
            />
          ) : (
            <>{title}</>
          )}
        </AccordionTitle>
      </AccordionSummary>
      <AccordionDetailsStyled
        sx={{
          px: 3,
          pt: 0,
          overflow: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isEdit ? (
          <StyledTextField
            variant="outlined"
            sx={{
              color: "black",
              fontSize: "larger",
              mt: "auto",
              mb: "auto",
            }}
            value={content}
            onClick={(e) => e.stopPropagation()}
            onChange={(newText) => editContent(newText)}
          />
        ) : (
          <Typography color={contentColor} variant="h6">
            {content}
          </Typography>
        )}

        {cornerIcon && (
          <>
            <Box sx={{ height: "20px" }} />

            <SvgIconWrapper right={right}>{cornerIcon}</SvgIconWrapper>
          </>
        )}
      </AccordionDetailsStyled>
    </AccordionStyled>
  );
};

const SvgIconWrapper = styled("div")(({ right }) => ({
  position: "absolute",
  bottom: "16px",
  left: right ? "auto" : "16px",
  right: right ? "16px" : "auto",
}));

const AccordionStyled = styled(Accordion)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
  display: "flex",
  [theme.breakpoints.up("sm")]: {
    width: "75%",
  },
  maxHeight: "375px",
  boxShadow: "none",
  [theme.breakpoints.up("md")]: {
    maxWidth: "50%",
  },
  "&.Mui-expanded": {
    height: "300px",
    [theme.breakpoints.up("sm")]: {
      height: "375px",
    },
    display: "flex",
    paddingBottom: "25px",
  },
  "&:not(.Mui-expanded)": {
    "& .MuiAccordionDetails-root": {
      display: "none",
    },
  },
  "& .MuiAccordion-region": {
    overflow: "auto",
  },
  "&::before": {
    display: "none",
  },
  "& .MuiAccordionDetails-root": {
    overflow: "auto !important",
  },
  // Webkit browsers (Chrome, Safari, newer versions of Edge)
  "&::-webkit-scrollbar": {
    width: "6px",
    background: "transparent", // Hide the background
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent", // Hide the track
  },
  "&::-webkit-scrollbar-thumb": {
    background: "white", // Semi-transparent black
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(0, 0, 0, 0.7)", // Darker on hover
  },
  "&::-webkit-scrollbar-button": {
    display: "none", // Remove arrows
  },

  // Firefox
  scrollbarWidth: "thin",
  scrollbarColor: "white transparent",

  // Edge and IE
  "-ms-overflow-style": "none", // Hide default scrollbar for IE/Edge

  // Hide scrollbar when not in use
  "&::-webkit-scrollbar-thumb": {
    background: "white",
    borderRadius: "3px",
    visibility: "hidden",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    visibility: "visible",
  },
}));

const AccordionDetailsStyled = styled(AccordionDetails)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
}));

const AccordionTitle = styled(Typography)({
  textTransform: "uppercase",
  color: "black",
  fontWeight: "bold",
  width: "100%",
});
