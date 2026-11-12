import { Toggle as Primitive } from "@base-ui/react/toggle";
import { ToggleGroup as Group } from "@base-ui/react/toggle-group";
import { cn } from "@/lib/utils";
export function ToggleGroup({ className, ...props }: Group.Props) {
  return <Group className={cn("ui-toggle-group", className)} {...props} />;
}
export function ToggleGroupItem({ className, ...props }: Primitive.Props) {
  return <Primitive className={cn("ui-toggle", className)} {...props} />;
}
