import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, BrainCircuit, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Chat", icon: MessageCircle },
  { path: "/quiz", label: "Quiz", icon: BrainCircuit },
  { path: "/progress", label: "Progress", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
