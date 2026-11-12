import { Button as Primitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
      ghost: "button-ghost",
      key: "button-key",
    },
    size: { default: "button-normal", sm: "button-small", icon: "button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
function Button({
  className,
  variant,
  size,
  ...props
}: Primitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <Primitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
export { Button, buttonVariants };
