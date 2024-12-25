import * as React from "react";
import { cn } from "@/lib/utils";

export interface RangeProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  indicator?: boolean;
}

const Range = React.forwardRef<HTMLInputElement, RangeProps>(
  ({ className, indicator = false, ...props }, ref) => {
    const [value, setValue] = React.useState(
      props.defaultValue || props.value || 0
    );

    // Calculate the percentage for positioning the indicator
    const calculatePosition = () => {
      const min = Number(props.min || 0);
      const max = Number(props.max || 100);
      const currentValue = Number(value);
      const range = max - min;
      const valueOffset = currentValue - min;
      return (valueOffset * 100) / range;
    };

    return (
      <div className="relative">
        <input
          type="range"
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20",
            // Thumb styles
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:transition-all",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            // Firefox thumb styles
            "[&::-moz-range-thumb]:h-4",
            "[&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:transition-all",
            "[&::-moz-range-thumb]:hover:scale-110",
            // Track styles
            "[&::-webkit-slider-runnable-track]:rounded-full",
            "[&::-moz-range-track]:rounded-full",
            // Focus styles
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-primary",
            "focus-visible:ring-offset-2",
            className
          )}
          ref={ref}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        {indicator && (
          <div
            className="absolute -top-6 left-0 min-w-8 rounded bg-primary px-1 py-0.5 text-center text-xs text-primary-foreground"
            style={{
              left: `calc(${calculatePosition()}% - 16px)`,
            }}
          >
            {value}
          </div>
        )}
      </div>
    );
  }
);
Range.displayName = "Range";

export { Range };
