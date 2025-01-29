//  use dynamic import with no ssr

import dynamic from "next/dynamic";

// import  ./CommunitySelection.jsx
const CommunitySelect = dynamic(() => import("./CommunitySelection"), {
  ssr: false,
});

const Page = () => {
  return <CommunitySelect />;
};

export default Page;
