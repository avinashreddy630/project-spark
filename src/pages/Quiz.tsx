import { Header } from "@/components/layout/Header";

export default function Quiz() {
  return (
    <div className="animate-fade-in">
      <Header title="Quiz Mode" />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <span className="text-5xl">🧠</span>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Quiz Mode</h2>
          <p className="mt-2 text-muted-foreground">Test your knowledge with AI-generated quizzes</p>
        </div>
      </div>
    </div>
  );
}
