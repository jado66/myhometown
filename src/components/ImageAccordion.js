import { ExpandLess } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  Fade,
  useTheme,
} from "@mui/material";

import { styled } from "@mui/system";

export const ImageAccordion = ({
  title,
  content,
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

            fontSize: { xs: "1rem", md: "auto" }, // Adjust the font size as needed
          }}
        >
          {title}
        </AccordionTitle>
      </AccordionSummary>
      <AccordionDetails
        sx={{ px: 3, pt: 0 }}
        PaperProps={{
          sx: { flex: 1, position: "relative", overflow: "auto" },
        }}
      >
        {/* <DividerStyled /> */}
        <Typography color={contentColor} variant="h6">
          {content}
        </Typography>
        {cornerIcon && (
          <SvgIconWrapper right={right}>{cornerIcon}</SvgIconWrapper>
        )}
      </AccordionDetails>
    </AccordionStyled>
  );
};

const SvgIconWrapper = styled("div")(({ right }) => ({
  position: "absolute",
  bottom: "16px", // Adjust this value as necessary
  left: right ? "auto" : "16px", // Condition for left positioning
  right: right ? "16px" : "auto", // Condition for right positioning
}));

const DividerStyled = styled(Divider)({
  backgroundColor: "black",
  width: "100%",
  marginTop: 0,
  borderWidth: "3px !important",
  marginBottom: "1em",
});

const AccordionStyled = styled(Accordion)(({ theme }) => ({
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  bottom: 0,
  width: "100%",
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
  },
  "&:not(.Mui-expanded)": {
    "& .MuiAccordionDetails-root": {
      display: "none",
    },
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionTitle = styled(Typography)({
  textTransform: "uppercase",
  color: "black",
  fontWeight: "bold",
  width: "100%",
});
