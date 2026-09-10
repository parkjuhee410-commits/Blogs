import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type NeoCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function NeoCard<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
  ...props
}: NeoCardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`bg-transparent md:border-[3px] md:bg-(--color-surface) md:shadow-[var(--shadow-offset)_var(--shadow-offset)_0_0_var(--color-border)] ${
        interactive ? "neo-interactive" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
