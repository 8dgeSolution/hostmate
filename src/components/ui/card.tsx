import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_24px_100px_rgba(15,118,110,0.08)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}