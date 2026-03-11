import { Header } from "@/components/layout/Header";

export default function Chat() {
  return (
    <div className="flex h-[100dvh] flex-col animate-fade-in">
      <Header title="AI Tutor" showBack />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl">🤖</span>
          <h2 className="mt-4 text-xl font-semibold text-foreground">AI Chat</h2>
          <p className="mt-2 text-muted-foreground">Ask any question to get started</p>
        </div>
      </div>
    </div>
  );
}
