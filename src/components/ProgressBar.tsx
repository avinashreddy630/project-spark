import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
