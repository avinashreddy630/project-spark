import { Header } from "@/components/layout/Header";

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <Header title="AIanswer" />
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Hello, Student! 👋</h2>
          <p className="mt-1 text-muted-foreground">What would you like to learn today?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {[
            { label: "Ask AI", emoji: "💬", desc: "Get instant answers" },
            { label: "Take Quiz", emoji: "🧠", desc: "Test your knowledge" },
            { label: "Summarize", emoji: "📝", desc: "Condense your notes" },
            { label: "Progress", emoji: "📊", desc: "View your stats" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary active:scale-[0.98]"
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="font-semibold text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.desc}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
