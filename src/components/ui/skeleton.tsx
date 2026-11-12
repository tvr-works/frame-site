import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
// Static placeholders convey window identity; they are not loading indicators.
const skeletonVariants = cva("ui-skeleton", {
  variants: {
    variant: {
      default: "skeleton-line",
      short: "skeleton-short",
      heading: "skeleton-heading",
      block: "skeleton-block",
    },
  },
  defaultVariants: { variant: "default" },
});
export function Skeleton({
  className,
  variant,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div data-slot="skeleton" className={cn(skeletonVariants({ variant, className }))} {...props} />
  );
}
