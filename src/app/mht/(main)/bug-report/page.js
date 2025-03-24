//  use dynamic import with no ssr

import dynamic from "next/dynamic";

// import  ./CommunitySelection.jsx
const BugReports = dynamic(() => import("./BugReports"), {
  ssr: false,
});

const Page = () => {
  return <BugReports />;
};

export default Page;
