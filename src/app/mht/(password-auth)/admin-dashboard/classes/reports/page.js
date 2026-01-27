"use client";
import dynamic from "next/dynamic";

const AdminReportsPage = dynamic(() => import("./AdminReportsPage"), {
  ssr: false,
});

const Page = () => {
  return <AdminReportsPage />;
};

export default Page;
