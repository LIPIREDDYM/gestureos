import { cn } from "@/utils/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_STYLES: Record<Tone, string> = {
  neutral: "bg-white/10 text-white/70",
  success: "bg-accent-green/15 text-accent-green",
  warning: "bg-accent-amber/15 text-accent-amber",
  danger: "bg-accent-pink/15 text-accent-pink",
  info: "bg-accent-blue/15 text-accent-blue",
};

const DOT_STYLES: Record<Tone, string> = {
  neutral: "bg-white/50",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  danger: "bg-accent-pink",
  info: "bg-accent-blue",
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone = "neutral", pulse, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_STYLES[tone],
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring", DOT_STYLES[tone])}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", DOT_STYLES[tone])} />
      </span>
      {label}
    </div>
  );
}
