import { getUser } from "@/lib/nostr/users";
import { headers } from "next/headers";
import Image from "next/image";
import QRCode from "qrcode";

import "./qrCode.css";
import { RemoveLogo } from "@/components/utils/RemoveLogo";
import Logo from "@/components/logo";
import { getEvent } from "@/lib/nostr/events";
import { GoalWidget } from "@/components/GoalWidget";

interface PageProps {
  params: { eventId: string };
}

export default async function GoalQRCodePage({ params }: PageProps) {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";

  if (!host) {
    return <div>Unable to generate QR code</div>;
  }

  const url = `${protocol}://${host}/goal/${params.eventId}`;

  const qrCode = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 10,
    width: 512,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const goalEvent = await getEvent(params.eventId);
  const user = await getUser(goalEvent.author.toBech32());
  const picture = user.getPicture();

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl border-4 border-primary p-2 pb-4 space-y-2 max-w-xs">
      <div className="text-black text-wrap text-3xl font-bold text-center">
        <Logo />
      </div>

      <div className="relative">
        <Image
          src={qrCode}
          alt="QR Code para perfil"
          width={512}
          height={512}
          priority
          className="mx-auto rounded-xl"
        />

        {picture && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative border-2 border-card rounded-full overflow-hidden w-24 h-24">
              <Image
                src={picture}
                fill
                alt="Picture"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <h1 className="text-primary text-wrap text-3xl font-bold text-center">
        Leia o código e ajude nossa meta
      </h1>

      <div className="py-4">
        <GoalWidget goalEventId={params.eventId} />
      </div>

      <RemoveLogo />
    </div>
  );
}
