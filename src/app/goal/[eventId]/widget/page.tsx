import "./widget.css";

import { GoalWidget } from "@/components/GoalWidget";

interface PageProps {
  params: { eventId: string };
}

export default async function widgetPage({ params }: PageProps) {
  return (
    <>
      <GoalWidget goalEventId={params.eventId} />
    </>
  );
}
