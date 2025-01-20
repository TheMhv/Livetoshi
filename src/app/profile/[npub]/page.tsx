import Form from "@/components/Form";
import { ProfileCard } from "@/components/ProfileCard";
import { loadConfig, Settings } from "@/lib/config";

const config: Settings = loadConfig();

interface PageProps {
  params: { npub: string };
}

export default async function ProfilePage({ params }: PageProps) {
  return (
    <ProfileCard npub={params.npub} relays={config.RELAYS}>
      <Form
        npub={params.npub}
        options={{
          MODELS: config.MODELS,
          MAX_TEXT_LENGTH: config.MAX_TEXT_LENGTH || 200,
          MIN_SATOSHI_QNT: config.MIN_SATOSHI_QNT || 21,
        }}
      />
    </ProfileCard>
  );
}
