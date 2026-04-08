import dynamic from "next/dynamic";

const CommunitySelect = dynamic(
  () => import("@/components/admin/CommunitySelection"),
  {
    ssr: false,
  }
);

const Page = () => {
  return <CommunitySelect />;
};

export default Page;
