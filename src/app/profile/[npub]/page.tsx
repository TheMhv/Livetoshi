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

  const banner = profile.getBanner();
  const name = profile.getDisplayName();
  const picture = profile.getPicture();

  return (
    <>
      {banner && (
        <Image
          src={banner}
          fill
          alt="background image"
          className="absolute top-0 left-0 object-cover blur brightness-75 -z-10 w-full h-full"
        />
      )}

      <Card className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center my-2">Livetoshi</h2>
        <CardHeader>
          {picture && (
            <div className="relative rounded-full w-[120px] h-[120px] mx-auto">
              <Image
                src={picture}
                fill={true}
                alt={`Picture of ${name}`}
                className="absolute top-0 left-0 object-cover rounded-full w-full h-full"
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-center">{name}</h2>

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
    </>
  );
}
