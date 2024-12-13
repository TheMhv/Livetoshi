import React from "react";
import { cn } from "@/lib/utils";

const ProgressBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { progress: number }
>(({ className, progress, ...props }, ref) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      ref={ref}
      className={cn(
        "w-full h-4 bg-gray-200 rounded-full overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
});
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
