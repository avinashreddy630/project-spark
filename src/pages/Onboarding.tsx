import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, BookOpen, Brain, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const welcomeSlides = [
  {
    icon: Sparkles,
    emoji: "✨",
    title: "Welcome to AIanswer",
    description: "Your personal AI-powered learning assistant that helps you study smarter.",
  },
  {
    icon: BookOpen,
    emoji: "📚",
    title: "Ask Anything",
    description: "Type or speak any question and get clear, easy-to-understand explanations instantly.",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "Practice & Quiz",
    description: "Generate practice questions and quizzes tailored to your subjects and level.",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and study streaks.",
  },
];

const academicLevels = [
  { id: "middle", label: "Middle School", emoji: "🏫", grades: "Grades 6-8" },
  { id: "high", label: "High School", emoji: "🎓", grades: "Grades 9-12" },
  { id: "college", label: "College", emoji: "🎒", grades: "Undergraduate" },
  { id: "graduate", label: "Graduate", emoji: "📖", grades: "Masters & PhD" },
];

const subjects = [
  { id: "math", label: "Mathematics", emoji: "🔢" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "cs", label: "Computer Science", emoji: "💻" },
  { id: "literature", label: "Literature", emoji: "📖" },
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "languages", label: "Languages", emoji: "🌍" },
  { id: "economics", label: "Economics", emoji: "📈" },
  { id: "art", label: "Art & Music", emoji: "🎨" },
];

type OnboardingStep = "welcome" | "level" | "subjects";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const finishOnboarding = () => {
    localStorage.setItem("aianswer_onboarded", "true");
    if (selectedLevel) localStorage.setItem("aianswer_level", selectedLevel);
    if (selectedSubjects.length > 0)
      localStorage.setItem("aianswer_subjects", JSON.stringify(selectedSubjects));
    navigate("/", { replace: true });
  };

  const skipOnboarding = () => {
    localStorage.setItem("aianswer_onboarded", "true");
    navigate("/", { replace: true });
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Welcome carousel
  if (step === "welcome") {
    const slide = welcomeSlides[slideIndex];
    const isLast = slideIndex === welcomeSlides.length - 1;

    return (
      <div className="flex min-h-[100dvh] flex-col bg-background px-6 py-8 safe-top safe-bottom">
        {/* Skip */}
        <div className="flex justify-end">
          <button
            onClick={skipOnboarding}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in" key={slideIndex}>
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-primary/10">
            <span className="text-5xl">{slide.emoji}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
          <p className="mt-3 max-w-xs text-muted-foreground">{slide.description}</p>
        </div>

        {/* Dots */}
        <div className="mb-6 flex justify-center gap-2">
          {welcomeSlides.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === slideIndex ? "w-6 bg-primary" : "w-2 bg-border"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {slideIndex > 0 && (
            <button
              onClick={() => setSlideIndex((i) => i - 1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) setStep("level");
              else setSlideIndex((i) => i + 1);
            }}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
          >
            {isLast ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Academic level selection
  if (step === "level") {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background px-6 py-8 safe-top safe-bottom animate-fade-in">
        <div className="flex justify-end">
          <button onClick={skipOnboarding} className="text-sm font-medium text-muted-foreground">
            Skip
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground">What's your level?</h2>
          <p className="mt-2 text-muted-foreground">This helps us tailor explanations for you</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {academicLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all",
                selectedLevel === level.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <span className="text-3xl">{level.emoji}</span>
              <span className="font-semibold text-foreground">{level.label}</span>
              <span className="text-xs text-muted-foreground">{level.grades}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex gap-3 pt-8">
          <button
            onClick={() => setStep("welcome")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setStep("subjects")}
            disabled={!selectedLevel}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Subject preferences
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-6 py-8 safe-top safe-bottom animate-fade-in">
      <div className="flex justify-end">
        <button onClick={skipOnboarding} className="text-sm font-medium text-muted-foreground">
          Skip
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground">Pick your subjects</h2>
        <p className="mt-2 text-muted-foreground">Select all the subjects you're studying</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {subjects.map((subject) => {
          const selected = selectedSubjects.includes(subject.id);
          return (
            <button
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <span className="text-2xl">{subject.emoji}</span>
              <span className={cn("text-sm font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
                {subject.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex gap-3 pt-8">
        <button
          onClick={() => setStep("level")}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={finishOnboarding}
          disabled={selectedSubjects.length === 0}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground disabled:opacity-40"
        >
          Start Learning
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
