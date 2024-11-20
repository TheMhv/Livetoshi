import { NostrProvider } from "@/components/NostrProvider";
import { TTSWidget } from "@/components/Widget";

import "./widget.css";

interface PageProps {
  params: { npub: string };
}

export default function widgetPage({ params }: PageProps) {
  return (
    <NostrProvider>
      <TTSWidget pubkey={params.npub} />
    </NostrProvider>
  );
}
