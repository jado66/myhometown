// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectFormsPage from "./ProjectPage";

export default function ProjectPage({ params }) {
  const { formId, date, communityId } = params;

  return (
    <ProjectFormProvider formId={formId} date={date} communityId={communityId}>
      <ProjectFormsPage formId={formId} date={date} communityId={communityId} />
    </ProjectFormProvider>
  );
}
