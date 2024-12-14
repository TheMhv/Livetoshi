import "./widget.css";

import { RemoveLogo } from "@/components/utils/RemoveLogo";
import { TTSWidget } from "@/components/Widget";

import { loadConfig, Settings } from "@/lib/config";
import { NostrProvider } from "@/components/NostrProvider";

const config: Settings = loadConfig();

interface PageProps {
  params: { npub: string };
}

export default function widgetPage({ params }: PageProps) {
  return (
    <>
      <RemoveLogo />
      <NostrProvider relays={config.RELAYS}>
        <TTSWidget pubkey={params.npub} />
      </NostrProvider>
    </>
  );
}
