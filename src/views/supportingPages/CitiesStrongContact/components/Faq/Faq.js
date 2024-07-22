import React from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Faq = () => {
  return (
    <Box>
      <Box marginBottom={4}>
        <Box
          component={Typography}
          fontWeight={700}
          variant={"h3"}
          align={"left"}
        >
          Frequently Asked Questions
        </Box>
      </Box>
      <Box>
        {[
          {
            title: "How do Days of Service work?",
            subtitle:
              "Specific projects are identified by civic leaders, neighbors, and My Hometown (MHT) local leadership.  MHT Block captains, who help identify the projects, are responsible for overseeing the project and assisting in providing the necessary resources. Day of Service is scheduled—typically a Saturday morning.  Multiple projects are scheduled for each Day of Service. These projects are typically home and neighbor clean-up but can be more involved as needs are identified.  Volunteers from nearby neighborhoods participate in the Day of Service. The city often provides dumpsters and heavy equipment, and the homeowner participates in the cost and service as they are able. ",
          },
          {
            title: "Is My Hometown a year-round program?",
            subtitle:
              "YES.  My Hometown community resource centers hold free classes in the evenings from September through June.  During the summer months Days of Service are held monthly on Saturday mornings June through August.",
          },
          {
            title: "How much do classes cost?",
            subtitle:
              "The classes are Free.  Everyone is invited to come and participate.  Go to the specific My Hometown community web page to see which classes are offered and the schedule.  Some classes fill up quickly and there may be a waiting list.",
          },
          {
            title: " How is My Hometown funded?",
            subtitle:
              "My Hometown is funded from several different sources.  The Church of Jesus Christ of Latter-day Saints is a major contributor.  Participating cities also assist financially and in-kind.  Donations to MHT are accepted through Cities Strong, a 501(c)(3) public charity.  This foundation was created to fund My Hometown and other initiatives that build strong communities and improve lives.",
          },
        ].map((item, i) => (
          <Box
            component={Accordion}
            key={i}
            padding={1}
            marginBottom={i === item.length - 1 ? 0 : 2}
            borderRadius={2}
            sx={{
              "&::before": {
                display: "none",
              },
              backgroundColor: "white",
              borderRadius: "0 !important", // Force border-radius to 0
              border: "2px solid black",
              "& .MuiAccordion-rounded:first-of-type": {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
              "& .MuiAccordion-rounded:last-of-type": {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id={`panel1a-header--${i}`}
              sx={{
                borderRadius: 0,
                "&.MuiAccordionSummary-root": {
                  backgroundColor: "white",
                  borderRadius: 0,
                },
                "&::before": {
                  display: "none",
                },
              }}
            >
              <Typography fontWeight={600}>{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.subtitle}</Typography>
            </AccordionDetails>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Faq;
