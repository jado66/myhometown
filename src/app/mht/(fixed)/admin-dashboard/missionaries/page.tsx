"use client";
import dynamic from "next/dynamic";

const DynamicMissionaryManagement = dynamic(
  () => import("./MissionaryManagement"),
  {
    ssr: false,
  }
);

const Page = () => {
  return <DynamicMissionaryManagement />;
};

export default Page;
