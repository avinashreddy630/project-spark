import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateQuiz } from "@/lib/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Clock,
  Lightbulb,
  Trophy,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
};

type QuizPhase = "setup" | "loading" | "playing" | "results";

const subjects = [
  { id: "mathematics", label: "Mathematics", emoji: "🔢" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "computer-science", label: "Computer Science", emoji: "💻" },
  { id: "literature", label: "Literature", emoji: "📖" },
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "economics", label: "Economics", emoji: "📈" },
];

const difficulties = [
  { id: "easy", label: "Easy", color: "text-accent" },
  { id: "medium", label: "Medium", color: "text-warning" },
  { id: "hard", label: "Hard", color: "text-destructive" },
];

export default function Quiz() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startQuiz = useCallback(async () => {
    if (!subject) { toast.error("Please select a subject"); return; }
    setPhase("loading");
    try {
      const data = await generateQuiz({ subject, difficulty, numQuestions, topic: topic || undefined });
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQ(0);
      setShowHint(false);
      setShowExplanation(false);
      setStartTime(Date.now());
      setPhase("playing");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate quiz");
      setPhase("setup");
    }
  }, [subject, difficulty, numQuestions, topic]);

  const selectAnswer = useCallback((optionIdx: number) => {
    if (answers[currentQ] !== null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
    setShowExplanation(true);
  }, [answers, currentQ]);

  const nextQuestion = useCallback(() => {
    setShowHint(false);
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  }, [currentQ, questions.length]);

  const prevQuestion = useCallback(() => {
    setShowHint(false);
    setShowExplanation(false);
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  }, [currentQ]);

  const finishQuiz = useCallback(async () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setElapsedTime(elapsed);
    const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

    if (user) {
      await supabase.from("quiz_sessions").insert({
        user_id: user.id,
        subject,
        difficulty,
        total_questions: questions.length,
        score,
        status: "completed",
        questions: questions as any,
        answers: answers as any,
        completed_at: new Date().toISOString(),
      });
    }

    setPhase("results");
  }, [answers, questions, startTime, user, subject, difficulty]);

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Setup screen
  if (phase === "setup") {
    return (
      <div className="animate-fade-in">
        <Header title="Quiz Mode" />
        <div className="px-4 py-5 space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Create a Quiz</h2>
            <p className="mt-1 text-sm text-muted-foreground">AI generates questions tailored to you</p>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Subject</label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all",
                    subject === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}
                >
                  <span>{s.emoji}</span>
                  <span className="font-medium text-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Topic (optional)</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quadratic equations, World War II..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all",
                    difficulty === d.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Questions: {numQuestions}</label>
            <input
              type="range"
              min={3}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <Button onClick={startQuiz} className="w-full rounded-xl h-12 text-base" disabled={!subject}>
            Generate Quiz <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (phase === "loading") {
    return (
      <div className="animate-fade-in">
        <Header title="Quiz Mode" showBack />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  // Results
  if (phase === "results") {
    return (
      <div className="animate-fade-in">
        <Header title="Results" />
        <div className="px-4 py-5 space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{scorePercent}%</h2>
            <p className="text-muted-foreground">{score} of {questions.length} correct</p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3 w-3" />
              {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
            </p>
          </div>

          <ProgressBar value={scorePercent} variant={scorePercent >= 70 ? "success" : scorePercent >= 40 ? "warning" : "destructive"} />

          {/* Answer breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Answer Breakdown</h3>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={i} className={cn("rounded-xl border p-4", isCorrect ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5")}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                      {!isCorrect && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Correct: {q.options[q.correctIndex]}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setPhase("setup"); }}>
              <BarChart3 className="mr-2 h-4 w-4" /> New Quiz
            </Button>
            <Button className="flex-1 rounded-xl" onClick={() => { setPhase("setup"); setSubject(""); setTopic(""); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  const q = questions[currentQ];
  const answered = answers[currentQ] !== null;
  const isCorrect = answered && answers[currentQ] === q?.correctIndex;
  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="flex h-[100dvh] flex-col animate-fade-in">
      <Header
        title={`Question ${currentQ + 1}/${questions.length}`}
        showBack
        rightAction={
          <span className="text-xs text-muted-foreground capitalize">{subject} · {difficulty}</span>
        }
      />

      {/* Progress */}
      <div className="px-4 pt-3">
        <ProgressBar value={((currentQ + 1) / questions.length) * 100} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {q && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">{q.question}</h2>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = answers[currentQ] === i;
                const isCorrectOption = i === q.correctIndex;
                let optionStyle = "border-border hover:border-primary/30";
                if (answered) {
                  if (isCorrectOption) optionStyle = "border-accent bg-accent/10";
                  else if (isSelected && !isCorrectOption) optionStyle = "border-destructive bg-destructive/10";
                  else optionStyle = "border-border opacity-60";
                } else if (isSelected) {
                  optionStyle = "border-primary bg-primary/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={answered}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      optionStyle
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                      answered && isCorrectOption ? "border-accent bg-accent text-accent-foreground" :
                      answered && isSelected ? "border-destructive bg-destructive text-destructive-foreground" :
                      "border-border text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-foreground">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {q.hint && !answered && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-sm text-warning"
              >
                <Lightbulb className="h-4 w-4" />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            )}
            {showHint && q.hint && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-foreground">
                💡 {q.hint}
              </div>
            )}

            {/* Explanation */}
            {showExplanation && answered && (
              <div className={cn(
                "rounded-xl border p-4 text-sm",
                isCorrect ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"
              )}>
                <p className="font-semibold text-foreground">{isCorrect ? "✅ Correct!" : "❌ Incorrect"}</p>
                <p className="mt-1 text-muted-foreground">{q.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-card p-4 safe-bottom">
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQ === 0} className="rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button onClick={nextQuestion} className="flex-1 rounded-xl" disabled={!answered}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishQuiz} className="flex-1 rounded-xl" disabled={!allAnswered}>
              Finish Quiz <Trophy className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
