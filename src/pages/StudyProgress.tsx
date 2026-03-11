import { Header } from "@/components/layout/Header";

export default function StudyProgress() {
  return (
    <div className="animate-fade-in">
      <Header title="Progress" />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <span className="text-5xl">📊</span>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Study Progress</h2>
          <p className="mt-2 text-muted-foreground">Track your learning journey</p>
        </div>
      </div>
    </div>
  );
}
