import Logo from "@/components/logo";
import { Card, CardHeader } from "@/components/ui/card";

export default async function Home() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <Logo className="text-3xl text-center my-2" />

        <p className="text-center text-gray-600">
          Enable TTS messages with voice models in your live stream using NOSTR
          Zaps
        </p>
      </CardHeader>
    </Card>
  );
}
