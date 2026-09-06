import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "rectangle" | "circle" | "text" | "card";
}

export function Skeleton({ className, variant = "rectangle", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-[#27272a]/60 animate-pulse",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 rounded",
        variant === "card" && "rounded-2xl border border-[#27272a] bg-[#141416]",
        className
      )}
      {...props}
    />
  );
}
