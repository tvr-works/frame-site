import { Check, Square } from "lucide-react";
import type { WindowKind } from "@/demo/model";
import { Skeleton } from "./ui/skeleton";
export function WindowContent({ kind }: { kind: WindowKind }) {
  if (kind === "notes")
    return (
      <div className="window-skeleton">
        <Skeleton variant="heading" />
        <div className="skeleton-checklist">
          <div>
            <Check />
            <Skeleton />
          </div>
          <div>
            <Square />
            <Skeleton variant="short" />
          </div>
          <div>
            <Square />
            <Skeleton />
          </div>
        </div>
      </div>
    );
  if (kind === "editor")
    return (
      <div className="window-skeleton skeleton-code">
        <Skeleton variant="short" />
        <div>
          <Skeleton />
          <Skeleton variant="short" />
        </div>
        <div>
          <Skeleton variant="short" />
          <Skeleton />
          <Skeleton variant="short" />
        </div>
      </div>
    );
  return (
    <div className="window-skeleton">
      <Skeleton variant="heading" />
      <div className="skeleton-paragraph">
        <Skeleton />
        <Skeleton />
        <Skeleton variant="short" />
      </div>
      <Skeleton variant="block" />
      <div className="skeleton-paragraph">
        <Skeleton />
        <Skeleton variant="short" />
      </div>
    </div>
  );
}
