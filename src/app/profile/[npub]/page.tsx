import Form from "@/components/profile/Form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loadConfig, Settings } from "@/lib/config";
import { getUser } from "@/lib/nostr/users";
import Image from "next/image";

const config: Settings = loadConfig();

interface PageProps {
  params: { npub: string };
}

export default async function GoalPage({ params }: PageProps) {
  const profile = await getUser(params.npub);

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <Card className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center my-2">LiveSatoshi</h2>
        <CardHeader>
          <Image
            src={profile.getPicture() || "/default-profile.png"}
            width={120}
            height={120}
            alt={`Picture of ${profile.getDisplayName()}`}
            className="rounded-full mx-auto"
          />

          <h2 className="text-2xl font-bold text-center">
            {profile.getDisplayName()}
          </h2>

          <p className="text-center text-gray-600">
            Envie uma mensagem para {profile.getName()} usando satoshis
          </p>
        </CardHeader>

        <CardContent>
          <Form
            npub={params.npub}
            config={config}
            // onPaymentSettled={handlePaymentSettled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
