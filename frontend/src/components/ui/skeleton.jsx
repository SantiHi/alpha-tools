// taken from shadcn component library: https://ui.shadcn.com/docs/components/skeleton
import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
