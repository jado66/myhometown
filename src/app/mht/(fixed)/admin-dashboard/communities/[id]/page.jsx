"use client";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import { useEffect, useState } from "react";
import { useCustomForms } from "@/hooks/useCustomForm";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { SignUpForm } from "@/components/SignUpForm";
import { Container, Divider } from "@mui/material";
import { useFormResponses } from "@/hooks/useFormResponses";
import { useCommunities } from "@/hooks/use-communities";
import { FormResponsesTable } from "@/components/FormResponseTable";

const DaysOfServicePage = ({ params }) => {
  const { id } = params;

  const [community, setCommunity] = useState(null);

  const { getCommunity } = useCommunities();

  useEffect(() => {
    getCommunity(id).then((c) => {
      setCommunity(c);
    });
  }, []);

  return (
    <Container>
      {/* <JsonViewer data={community} /> */}

      {community?.volunteerSignUpId && (
        <>
          <h1>Days Of Service Volunteers</h1>
          <FormResponsesTable formId={community.volunteerSignUpId} />
        </>
      )}
    </Container>
  );
};

export default DaysOfServicePage;
