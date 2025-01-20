import { GoalCard } from "@/components/GoalCard";
import { loadConfig, Settings } from "@/lib/config";

const config: Settings = loadConfig();

interface PageProps {
  params: { eventId: string };
}

export default async function GoalPage({ params }: PageProps) {
  return (
    <GoalCard
      id={params.eventId}
      relays={config.RELAYS}
      checkInterval={config.QUEUE_CHECK_INTERVAL}
      formOptions={{
        MODELS: config.MODELS,
        MAX_TEXT_LENGTH: config.MAX_TEXT_LENGTH || 200,
        MIN_SATOSHI_QNT: config.MIN_SATOSHI_QNT || 21,
      }}
    />
  );
}
