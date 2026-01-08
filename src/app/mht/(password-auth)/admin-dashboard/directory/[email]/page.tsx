"use client";
import dynamic from "next/dynamic";

const DynamicMissionaryDirectory = dynamic(
  () => import("../MissionaryDirectory"),
  {
    ssr: false,
  }
);

const Page = ({ params }: { params: { email: string } }) => {
  return (
    <DynamicMissionaryDirectory email={decodeURIComponent(params.email)} />
  );
};

export default Page;
