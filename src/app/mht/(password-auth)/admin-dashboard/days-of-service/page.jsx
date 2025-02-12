//  use dynamic import with no ssr

import dynamic from "next/dynamic";

// import  ./CommunitySelection.jsx
const CitySelect = dynamic(() => import("./CitySelection"), {
  ssr: false,
});

const Page = () => {
  return <CitySelect />;
};

export default Page;
