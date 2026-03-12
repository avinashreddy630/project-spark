import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Flame,
  Clock,
  BrainCircuit,
  MessageCircle,
  Trophy,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function StudyProgress() {
  const { user } = useAuth();
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [todayProgress, setTodayProgress] = useState({ minutes: 0, questions: 0, quizzes: 0, streak: 0 });

  useEffect(() => {
    if (!user) return;

    supabase
      .from("quiz_sessions")
      .select("*")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setQuizHistory(data); });

    supabase
      .from("study_progress")
      .select("*")
      .eq("date", new Date().toISOString().split("T")[0])
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTodayProgress({
          minutes: data.minutes_studied ?? 0,
          questions: data.questions_asked ?? 0,
          quizzes: data.quizzes_completed ?? 0,
          streak: data.streak_days ?? 0,
        });
      });
  }, [user]);

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / quizHistory.length)
    : 0;

  const stats = [
    { icon: Flame, label: "Streak", value: `${todayProgress.streak} days`, color: "text-destructive bg-destructive/10" },
    { icon: Clock, label: "Today", value: `${todayProgress.minutes}m`, color: "text-primary bg-primary/10" },
    { icon: MessageCircle, label: "Questions", value: String(todayProgress.questions), color: "text-accent bg-accent/10" },
    { icon: BrainCircuit, label: "Quizzes", value: String(todayProgress.quizzes), color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Progress" />
      <div className="px-4 py-5 space-y-6">
        {!user && (
          <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            Sign in to track your study progress
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Average score */}
        {quizHistory.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-foreground">Average Quiz Score</span>
              </div>
              <span className="text-sm font-medium text-primary">{avgScore}%</span>
            </div>
            <ProgressBar value={avgScore} variant={avgScore >= 70 ? "success" : avgScore >= 40 ? "warning" : "destructive"} />
          </div>
        )}

        {/* Quiz history */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Calendar className="h-4 w-4" /> Recent Quizzes
          </h3>
          {quizHistory.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No quizzes completed yet. Take your first quiz!
            </div>
          ) : (
            <div className="space-y-2">
              {quizHistory.map(q => {
                const pct = Math.round((q.score / q.total_questions) * 100);
                return (
                  <div key={q.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                      pct >= 70 ? "bg-accent/10 text-accent" : pct >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    )}>
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium capitalize text-foreground">{q.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.score}/{q.total_questions} · {q.difficulty} · {new Date(q.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
