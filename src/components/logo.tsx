import * as React from "react";
import { cn } from "@/lib/utils";

const Logo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("font-bold", className)} {...props}>
    <span className="text-black">Live</span>
    <span className="text-primary">toshi</span>
  </span>
));
Logo.displayName = "Logo";

export default Logo;
