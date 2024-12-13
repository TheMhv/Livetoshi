import Logo from "@/components/logo";
import { Card, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="space-y-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <Logo className="text-3xl text-center my-2" />

          <p className="text-center text-gray-600">
            Enable TTS messages with voice models in your live stream using
            NOSTR Zaps
          </p>
        </CardHeader>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center my-2">Usage</h1>

          <h1 className="text-2xl font-bold my-2">Zaps</h1>

          <p className="text-gray-600">
            You can go to
            <span className="text-primary font-bold mx-1">
              {"/profile/{npub}"}
            </span>
            to access some profile:
          </p>

          <Link
            href="/profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqwduqhrhy7lwtmm727m086u5sqnuvcz"
            className="text-sm text-primary font-bold text-center truncate hover:underline"
          >
            /profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqwduqhrhy7lwtmm727m086u5sqnuvcz
          </Link>

          <span className="py-1"></span>

          <p className="text-gray-600">
            And
            <span className="text-primary font-bold mx-1">{"/widget"}</span>
            to access the TTS widget:
          </p>

          <Link
            href="/profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqwduqhrhy7lwtmm727m086u5sqnuvcz/widget"
            className="text-sm text-primary font-bold text-center truncate hover:underline"
          >
            /profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqw.../widget
          </Link>

          {/* TODO: Configure Widget */}

          <p className="text-xs font-semibold pt-2">
            * You can run with custom voices models. Find more information on
            <Link
              href="https://github.com/TheMhv/Livetoshi-TTS"
              className="text-primary font-bold underline mx-1"
            >
              TTS repo
            </Link>
          </p>

          <span className="py-2"></span>

          <h1 className="text-2xl font-bold my-2">Goals</h1>

          <p className="text-gray-600">
            You can go to
            <span className="text-primary font-bold mx-1">
              {"/goal/{eventId}"}
            </span>
            to access some NOSTR goal event:
          </p>

          <Link
            href="/goal/fde6cf806cf4e551dd078018c84c7c8cfea88176c22704cc2a56c486851fd7e4"
            className="text-sm text-primary font-bold text-center truncate hover:underline"
          >
            /goal/fde6cf806cf4e551dd078018c84c7c8cfea88176c22704cc2a56c486851fd7e4
          </Link>

          {/* TODO: Create Goal */}
        </CardHeader>
      </Card>
    </div>
  );
}
