import { Toggle as Primitive } from "@base-ui/react/toggle";
import { ToggleGroup as Group } from "@base-ui/react/toggle-group";
import { cn } from "@/lib/utils";
export function ToggleGroup({
  className,
  appearance = "default",
  ...props
}: Group.Props & { appearance?: "default" | "ladder" }) {
  return (
    <Group
      className={cn("ui-toggle-group", appearance === "ladder" && "toggle-ladder", className)}
      {...props}
    />
  );
}
export function ToggleGroupItem({ className, ...props }: Primitive.Props) {
  return <Primitive className={cn("ui-toggle", className)} {...props} />;
}
