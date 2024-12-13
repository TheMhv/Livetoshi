import ProfileBadge from "./ProfileBadge";

export default function CornerMenu() {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-3 p-4 sm:p-5">
      <ProfileBadge />
    </div>
  );
}
