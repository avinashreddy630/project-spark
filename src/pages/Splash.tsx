import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [phase, setPhase] = useState<"logo" | "loading" | "done">("logo");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("loading"), 800);
    const t2 = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase === "done") {
      const hasOnboarded = localStorage.getItem("aianswer_onboarded");
      if (hasOnboarded) {
        navigate("/", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [phase, navigate]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-primary px-6">
      {/* Logo */}
      <div
        className={`flex flex-col items-center transition-all duration-700 ${
          phase === "logo" ? "scale-100 opacity-100" : "scale-95 opacity-100"
        }`}
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm">
          <span className="text-5xl">🧠</span>
        </div>
        <h1 className="text-3xl font-bold text-primary-foreground">AIanswer</h1>
        <p className="mt-2 text-sm text-primary-foreground/70">Your AI Learning Assistant</p>
      </div>

      {/* Loading indicator */}
      <div
        className={`mt-12 transition-all duration-500 ${
          phase !== "logo" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary-foreground/60"
              style={{
                animation: "pulse-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute bottom-8 flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground backdrop-blur-sm">
          <WifiOff className="h-4 w-4" />
          <span>You're offline</span>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
