import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  User,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Bell,
  ChevronRight,
  Loader2,
  GraduationCap,
  BookOpen,
} from "lucide-react";

const academicLevels = [
  { id: "middle", label: "Middle School" },
  { id: "high", label: "High School" },
  { id: "college", label: "College" },
  { id: "graduate", label: "Graduate" },
];

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  const updateLevel = async (level: string) => {
    if (!user) return;
    await supabase.from("profiles").update({ academic_level: level }).eq("id", user.id);
    setProfile((p: any) => ({ ...p, academic_level: level }));
    localStorage.setItem("aianswer_level", level);
    toast.success("Level updated");
  };

  return (
    <div className="animate-fade-in">
      <Header title="Profile" />
      <div className="px-4 py-5 space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            {user ? (
              <>
                <p className="font-semibold text-foreground">{profile?.display_name || "Student"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground">Guest</p>
                <p className="text-sm text-muted-foreground">Sign in to save your progress</p>
              </>
            )}
          </div>
        </div>

        {!user && (
          <div className="flex gap-3">
            <Button onClick={() => navigate("/login")} className="flex-1 rounded-xl">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate("/signup")} className="flex-1 rounded-xl">
              Create Account
            </Button>
          </div>
        )}

        {/* Academic Level */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Academic Level</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {academicLevels.map(l => (
              <button
                key={l.id}
                onClick={() => updateLevel(l.id)}
                className={cn(
                  "rounded-xl border-2 py-2.5 text-sm font-medium transition-all",
                  (profile?.academic_level || localStorage.getItem("aianswer_level")) === l.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-1">
          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary"
          >
            {isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            <span className="flex-1 text-sm text-foreground">Dark Mode</span>
            <div className={cn(
              "h-6 w-10 rounded-full p-0.5 transition-colors",
              isDark ? "bg-primary" : "bg-border"
            )}>
              <div className={cn(
                "h-5 w-5 rounded-full bg-primary-foreground transition-transform",
                isDark ? "translate-x-4" : "translate-x-0"
              )} />
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">Notifications</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/summarizer")}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-secondary"
          >
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">Note Summarizer</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {user && (
          <Button variant="outline" onClick={handleSignOut} className="w-full rounded-xl text-destructive border-destructive/30">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
