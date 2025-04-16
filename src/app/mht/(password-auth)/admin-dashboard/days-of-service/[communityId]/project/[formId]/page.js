// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";

import ProjectPage from "../../components/ProjectForm/ProjectPage";
import { useEffect } from "react";
import { useCommunityData } from "@/hooks/useCommunityData";

export default function Page({ params }) {
  const { formId, communityId } = params;

  const {
    community: communityData,
    formConfig,
    loading: communityLoading,
  } = useCommunityData(communityId);

  return (
    <>
      <ProjectFormProvider formId={formId} communityId={communityId}>
        <ProjectPage
          formId={formId}
          communityId={communityId}
          communityData={communityData}
        />
      </ProjectFormProvider>
    </>
  );
}
