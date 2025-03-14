"use client";
import { useEffect, useState } from "react";

import { useCommunities } from "@/hooks/use-communities";
import { FormResponseTable } from "@/components/FormResponseTable";
import { Box, Button, Typography } from "@mui/material";

const VolunteerSignUps = ({ communityId }) => {
  const [community, setCommunity] = useState(null);

  const { getCommunity } = useCommunities();

  const goToEditDaysOfServiceForm = () => {
    console.log("Edit Days of Service Form");
  };

  useEffect(() => {
    getCommunity(communityId).then((c) => {
      setCommunity(c);
    });
  }, []);

  if (!community) {
    return <div>Loading...</div>;
  }

  const editDaysOfServiceFormLink =
    community &&
    `/edit/utah/${community.city
      .toLowerCase()
      .replace(" ", "-")}/${community.name
      .toLowerCase()
      .replace(" ", "-")}/days-of-service`;

  if (!community.volunteerSignUpId) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" sx={{ ml: 2 }}>
          No volunteer sign up form found
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 1 }}
          href={process.env.NEXT_PUBLIC_DOMAIN + editDaysOfServiceFormLink}
        >
          Create Volunteer Sign Up Form
        </Button>
      </Box>
    );
  }

  return (
    <>
      <h1>Days Of Service Volunteers {communityId}</h1>
      <FormResponseTable formId={community?.volunteerSignUpId} />
    </>
  );
};

export default VolunteerSignUps;
