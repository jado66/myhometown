//  use dynamic import with no ssr

import dynamic from "next/dynamic";

// import  ./CommunitySelection.jsx
const CommunityPage = dynamic(() => import("./CommunityPage"), {
  ssr: false,
});

const Page = () => {
  return <CommunityPage />;
};

export default Page;
