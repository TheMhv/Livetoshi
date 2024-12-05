import { getUser } from "@/lib/nostr/users";
import { headers } from "next/headers";
import Image from "next/image";
import QRCode from "qrcode";

import "../widget/widget.css";

interface PageProps {
  params: { npub: string };
}

export default async function QRCodePage({ params }: PageProps) {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";

  if (!host) {
    return <div>Unable to generate QR code</div>;
  }

  const url = `${protocol}://${host}/profile/${params.npub}`;

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

  const user = await getUser(params.npub);
  const picture = user.getPicture();

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl border-4 border-primary p-2 pb-4 space-y-2 max-w-xs">
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
            <div className="relative border-2 border-card rounded-full overflow-hidden w-20 h-20">
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
        Leia o código e envie sua mensagem
      </h1>
    </div>
  );
}
