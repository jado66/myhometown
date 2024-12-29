// pages/project-sheets
"use client";

import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import ProjectFormPage from "./ProjectPage";

export default function ProjectPage() {
  return (
    <ProjectFormProvider>
      <ProjectFormPage />
    </ProjectFormProvider>
  );
}
