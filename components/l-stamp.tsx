import { cn } from "@/lib/utils";

type StampSize = "micro" | "tiny" | "small" | "large";

export function LStamp({
  size = "small",
  className,
}: {
  size?: StampSize;
  className?: string;
}) {
  return (
    <span className={cn("l-stamp", "l-stamp-" + size, className)} aria-hidden="true">
      <svg viewBox="0 0 64 64" role="presentation">
        <path className="stamp-frame" d="M8 6.5 57 8l-1 48.5L7 55z" />
        <path className="stamp-letter" d="M22 17v29h22" />
      </svg>
    </span>
  );
}
