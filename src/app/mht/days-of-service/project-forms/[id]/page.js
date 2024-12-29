// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectFormPage from "../ProjectPage";

export default function ProjectPage({ params }) {
  const { id } = params;

  return (
    <ProjectFormProvider id={id}>
      <ProjectFormPage />
    </ProjectFormProvider>
  );
}
