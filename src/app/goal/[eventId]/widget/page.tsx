import { getEvent } from "@/lib/nostr/events";
import "./widget.css";

import { GoalWidget } from "@/components/GoalWidget";
import { RemoveLogo } from "@/components/utils/RemoveLogo";

interface PageProps {
  params: { eventId: string };
}

export default async function widgetPage({ params }: PageProps) {
  const goalEvent = await getEvent(params.eventId);
  return (
    <>
      <GoalWidget goalEventJson={goalEvent.asJson()} />
      <RemoveLogo />
    </>
  );
}
