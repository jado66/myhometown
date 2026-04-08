"use client";
import dynamic from "next/dynamic";

const DynamicImpersonate = dynamic(() => import("./ImpersontateUser"), {
  ssr: false,
});

const ImpersonateUserPage = () => {
  return <DynamicImpersonate />;
};

export default ImpersonateUserPage;
