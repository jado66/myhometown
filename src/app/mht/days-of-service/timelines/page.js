// app/days-of-service/timelines/page.js
import dynamic from "next/dynamic";

const StatusTable = dynamic(
  () =>
    import(
      "../../(password-auth)/admin-dashboard/days-of-service/[communityId]/[date]/view-timeline/StatusTable"
    ),
  {
    ssr: false,
  }
);

export default function TimelinePage() {
  return <StatusTable />;
}
