// app/days-of-service/timelines/page.js
import dynamic from "next/dynamic";

const StatusTable = dynamic(() => import("./StatusTable"), {
  ssr: false,
});

export default function TimelinePage({ params: { communityId, date } }) {
  return <StatusTable communityId={communityId} date={date} />;
}
