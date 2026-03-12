import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length >= 8 ? (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) ? "strong" : "medium") : password.length > 0 ? "weak" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name || undefined);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created! Check your email to verify.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 safe-top safe-bottom animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordStrength && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", {
                    "w-1/3 bg-destructive": passwordStrength === "weak",
                    "w-2/3 bg-warning": passwordStrength === "medium",
                    "w-full bg-accent": passwordStrength === "strong",
                  })} />
                </div>
                <span className="text-xs text-muted-foreground capitalize">{passwordStrength}</span>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | Record<string, boolean> | false | undefined)[]) {
  return classes
    .flatMap(c => {
      if (!c) return [];
      if (typeof c === "string") return [c];
      return Object.entries(c).filter(([, v]) => v).map(([k]) => k);
    })
    .join(" ");
}
