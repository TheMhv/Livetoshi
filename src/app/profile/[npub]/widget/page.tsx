import { NostrProvider } from "@/components/NostrProvider";
import { TTSWidget } from "@/components/Widget";

import "./widget.css";
import { RemoveLogo } from "@/components/utils/RemoveLogo";

interface PageProps {
  params: { npub: string };
}

export default function widgetPage({ params }: PageProps) {
  return (
    <>
      <RemoveLogo />
      <NostrProvider>
        <TTSWidget pubkey={params.npub} />
      </NostrProvider>
    </>
  );
}