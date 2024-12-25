import "./widget.css";

import { TTSWidget } from "@/components/Widget";

interface PageProps {
  params: { npub: string };
}

export default function widgetPage({ params }: PageProps) {
  return (
    <>
      <TTSWidget pubkey={params.npub} />
    </>
  );
}
