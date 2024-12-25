import { loadConfig, Settings } from "@/lib/config";
import { NostrProvider } from "../NostrProvider";
import ProfileBadge from "./ProfileBadge";

const config: Settings = loadConfig();

export default function CornerMenu() {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-3 p-4 sm:p-5">
      <NostrProvider relays={config.RELAYS} withSigner={true}>
        <ProfileBadge />
      </NostrProvider>
    </div>
  );
}
