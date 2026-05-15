import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variant === "primary"
          ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
          : "border border-[var(--line)] bg-white/80 text-slate-700 hover:bg-white",
        className,
      )}
      {...props}
    />
  );
}