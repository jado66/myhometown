"use client";
import { DaysOfServiceContent } from "@/views/dayOfService/DaysOfService";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import useCommunity from "@/hooks/use-community";
import { VolunteerSignUps } from "@/components/VolunteerSignUps";

const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  return (
    <>
      <DaysOfServiceContent />;
      <VolunteerSignUps
        isEdit
        volunteerHeaderText={() => alert("In progress")}
        volunteerHeaderImage={() => alert("In progress")}
        setVolunteerHeaderText={() => alert("In progress")}
        setVolunteerHeaderImage={() => alert("In progress")}
        signUpFormId={() => alert("In progress")}
        setSignUpFormId={() => alert("In progress")}
        onClose={() => {}}
      />
    </>
  );
};

export default DaysOfServicePage;
