//  use dynamic import with no ssr

import dynamic from "next/dynamic";

// import  ./CommunitySelection.jsx
const CityPage = dynamic(() => import("./CityPage"), {
  ssr: false,
});

const Page = () => {
  return <CityPage />;
};

export default Page;
