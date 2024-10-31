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

      <Card className="min-w-[28rem] max-w-md mx-auto shadow-xl relative">
        <CardHeader className="mt-10">
          {picture && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-card rounded-full overflow-hidden w-28 h-28">
              <Image
                src={picture}
                fill={true}
                alt={`Picture of ${name}`}
                className="object-cover"
              />
            </div>
          )}

          <h2 className="text-2xl font-bold text-center">{name}</h2>

          <p className="text-center text-gray-600">
            Envie uma mensagem e ajude nossa meta!
          </p>

          <div className="py-2 space-y-2">
            <p className="text-center font-bold">{event.content}</p>

            <div>
              <ProgressBar progress={progressPercentage} />
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-primary">
                  {progressPercentage.toFixed(2)}%
                </span>
                <span>
                  {zapsSum / 1000} /{" "}
                  <span className="font-bold">{goalAmount / 1000}</span>
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
          />
        </CardContent>
      </Card>
    </>
  );
}
