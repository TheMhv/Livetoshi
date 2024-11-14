import type { Metadata } from "next";
import "./globals.css";
import { Card } from "@/components/ui/card";
import Logo from "@/components/logo";
import Link from "next/link";
// import CornerMenu from "@/components/cornerMenu/cornerMenu";
// import { NostrProvider } from "@/components/NostrProvider";

export const metadata: Metadata = {
  title: "Livetoshi",
  description:
    "Enable TTS messages with voice models in your live stream using the Lightning Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased relative">
        {/* <NostrProvider>
          <CornerMenu />
        </NostrProvider> */}

        <div className="flex items-center justify-center min-h-screen font-sans">
          <div>
            {children}

            <Link href="https://github.com/TheMhv/Livetoshi">
              <Card className="backdrop-invert backdrop-blur-lg hover:scale-95 px-2 py-1 max-w-fit mx-auto my-5">
                <Logo />
              </Card>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
