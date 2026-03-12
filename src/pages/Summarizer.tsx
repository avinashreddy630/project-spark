import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { streamChat } from "@/lib/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Copy, Check, Download, Sparkles } from "lucide-react";

type SummaryLength = "short" | "medium" | "long";

export default function Summarizer() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [length, setLength] = useState<SummaryLength>("medium");
  const [copied, setCopied] = useState(false);

  const summarize = useCallback(async () => {
    if (!text.trim()) { toast.error("Please enter some notes to summarize"); return; }
    setIsProcessing(true);
    setSummary("");

    const lengthInstruction = {
      short: "Create a very brief summary in 2-3 bullet points.",
      medium: "Create a balanced summary covering all key points with moderate detail.",
      long: "Create a comprehensive summary with detailed explanations of all concepts.",
    }[length];

    let accumulated = "";
    await streamChat({
      messages: [{ role: "user", content: `${lengthInstruction}\n\nNotes to summarize:\n${text}` }],
      mode: "summarize",
      onDelta: (chunk) => {
        accumulated += chunk;
        setSummary(accumulated);
      },
      onDone: async () => {
        setIsProcessing(false);
        if (user && accumulated) {
          await supabase.from("note_summaries").insert({
            user_id: user.id,
            original_text: text,
            summary: accumulated,
            summary_length: length,
          });
        }
      },
      onError: (err) => {
        setIsProcessing(false);
        toast.error(err);
      },
    });
  }, [text, length, user]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [summary]);

  const downloadSummary = useCallback(() => {
    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [summary]);

  return (
    <div className="animate-fade-in">
      <Header title="Summarize Notes" showBack />
      <div className="px-4 py-5 space-y-5">
        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Your Notes</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes or study material here..."
            rows={8}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">{text.length} characters</p>
        </div>

        {/* Length selector */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Summary Length</label>
          <div className="flex gap-2">
            {(["short", "medium", "long"] as SummaryLength[]).map(l => (
              <button
                key={l}
                onClick={() => setLength(l)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all",
                  length === l ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={summarize} className="w-full rounded-xl h-11" disabled={isProcessing || !text.trim()}>
          {isProcessing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Summarize</>
          )}
        </Button>

        {/* Summary result */}
        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadSummary} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Download className="h-3 w-3" /> Export
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
