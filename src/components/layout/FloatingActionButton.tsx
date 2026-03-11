import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/chat")}
      className={cn(
        "fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
        className
      )}
      aria-label="Start AI Chat"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
