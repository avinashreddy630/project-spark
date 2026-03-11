import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/ProgressBar";
import {
  MessageCircle,
  BrainCircuit,
  FileText,
  BarChart3,
  Flame,
  Clock,
  BookOpen,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    label: "Ask AI",
    icon: MessageCircle,
    desc: "Get instant answers",
    path: "/chat",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Take Quiz",
    icon: BrainCircuit,
    desc: "Test your knowledge",
    path: "/quiz",
    color: "bg-accent/10 text-accent",
  },
  {
    label: "Summarize",
    icon: FileText,
    desc: "Condense your notes",
    path: "/chat",
    color: "bg-warning/10 text-warning",
  },
  {
    label: "Progress",
    icon: BarChart3,
    desc: "View your stats",
    path: "/progress",
    color: "bg-success/10 text-success",
  },
];

const recentSessions = [
  {
    id: 1,
    title: "Quadratic Equations",
    subject: "Mathematics",
    emoji: "🔢",
    time: "2 hours ago",
    type: "chat",
  },
  {
    id: 2,
    title: "World War II Timeline",
    subject: "History",
    emoji: "🏛️",
    time: "Yesterday",
    type: "quiz",
  },
  {
    id: 3,
    title: "Cell Biology Notes",
    subject: "Science",
    emoji: "🔬",
    time: "2 days ago",
    type: "summary",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userName = "Student";
  const streak = 5;
  const todayMinutes = 45;
  const weeklyGoalPercent = 68;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="AIanswer"
        rightAction={
          <button
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isRefreshing && "animate-spin")} />
          </button>
        }
      />

      <div className="px-4 py-5">
        {/* Greeting & Streak */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {userName}! 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">What would you like to learn today?</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-6 flex gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{streak}</p>
              <p className="text-[11px] text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{todayMinutes}m</p>
              <p className="text-[11px] text-muted-foreground">Today</p>
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <span className="text-sm font-semibold text-foreground">Weekly Goal</span>
            </div>
            <span className="text-sm font-medium text-primary">{weeklyGoalPercent}%</span>
          </div>
          <ProgressBar value={weeklyGoalPercent} variant="default" />
          <p className="mt-2 text-xs text-muted-foreground">
            {100 - weeklyGoalPercent}% more to reach your weekly goal
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-all active:scale-[0.97]"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Sessions
            </h3>
            <button
              onClick={() => navigate("/progress")}
              className="text-xs font-medium text-primary"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">
                  {session.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.subject} · {session.time}
                  </p>
                </div>
                <div className="flex items-center">
                  {session.type === "chat" && <MessageCircle className="h-4 w-4 text-muted-foreground" />}
                  {session.type === "quiz" && <BrainCircuit className="h-4 w-4 text-muted-foreground" />}
                  {session.type === "summary" && <BookOpen className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
