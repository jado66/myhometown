// app/days-of-service/timelines/page.js
import dynamic from "next/dynamic";

const StatusTable = dynamic(() => import("./StatusTable"), {
  ssr: false,
});

export default function TimelinePage() {
  return <StatusTable />;
}
