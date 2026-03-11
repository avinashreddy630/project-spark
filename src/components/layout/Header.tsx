import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack = false, rightAction, className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-lg safe-top",
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold text-foreground">{title}</h1>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
}
