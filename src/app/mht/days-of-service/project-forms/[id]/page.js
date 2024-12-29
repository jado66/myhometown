// pages/project-sheets/[id].js
"use client";
import { ProjectFormProvider } from "@/contexts/ProjectFormProvider";
import { useRouter } from "next/navigation";
import ProjectFormPage from "../ProjectPage";

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProjectFormProvider id={id}>
      <ProjectFormPage />
    </ProjectFormProvider>
  );
}
