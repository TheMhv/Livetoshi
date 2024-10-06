import Form from "@/components/goals/Form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progressBar";
import { loadConfig, Settings } from "@/lib/config";
import { getEvent } from "@/lib/nostr/events";
import { getUser } from "@/lib/nostr/users";
import { getFromEvent } from "@/lib/nostr/zaps";
import { Event } from "@rust-nostr/nostr-sdk";
import Image from "next/image";

const config: Settings = loadConfig();

interface PageProps {
  params: { eventId: string };
}

export default async function GoalPage({ params }: PageProps) {
  const event = await getEvent(params.eventId);
  const profile = await getUser(event.author.toBech32());

  const zaps = (await getFromEvent(event.id.toBech32())).sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  const zapsSum = zaps.reduce((sum, zap) => {
    const amount = parseInt(
      Event.fromJson(zap.getTagContent("description") || "").getTagContent(
        "amount"
      ) || "0"
    );
    return sum + amount;
  }, 0);

  const goalAmount = parseInt(event.getTagContent("amount") || "0");
  const progressPercentage = (zapsSum / goalAmount) * 100;

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
            Envie uma mensagem e ajude nossa meta!
          </p>

          <div>
            <p className="text-center font-bold">{event.content}</p>

            <div>
              <ProgressBar progress={progressPercentage} />
              <div className="flex items-center justify-between w-full">
                <span>{progressPercentage.toFixed(2)}%</span>
                <span>
                  {zapsSum / 1000} / {goalAmount / 1000}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form
            npub={event.author.toBech32()}
            eventId={event.id.toBech32()}
            config={config}
            // onPaymentSettled={handlePaymentSettled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
