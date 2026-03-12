import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { streamChat } from "@/lib/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Mic,
  MicOff,
  Copy,
  Check,
  History,
  Plus,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setConversations(data); });
  }, [user, conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const saveMessages = useCallback(async (convId: string, msgs: Msg[]) => {
    if (!user) return;
    const lastTwo = msgs.slice(-2);
    for (const msg of lastTwo) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        user_id: user.id,
        role: msg.role,
        content: msg.content,
      });
    }
    // Update conversation title from first user message
    if (msgs.length <= 2) {
      const firstUserMsg = msgs.find(m => m.role === "user");
      if (firstUserMsg) {
        await supabase.from("conversations").update({
          title: firstUserMsg.content.slice(0, 80),
          updated_at: new Date().toISOString(),
        }).eq("id", convId);
      }
    } else {
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    }
  }, [user]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let convId = conversationId;
    if (!convId && user) {
      const { data } = await supabase.from("conversations").insert({
        user_id: user.id,
        title: text.slice(0, 80),
      }).select("id").single();
      if (data) {
        convId = data.id;
        setConversationId(data.id);
      }
    }

    let assistantContent = "";
    const controller = new AbortController();
    abortRef.current = controller;

    await streamChat({
      messages: newMessages,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      },
      onDone: () => {
        setIsStreaming(false);
        abortRef.current = null;
      },
      onError: (err) => {
        setIsStreaming(false);
        toast.error(err);
      },
      signal: controller.signal,
    });

    if (convId && user && assistantContent) {
      const finalMsgs = [...newMessages, { role: "assistant" as const, content: assistantContent }];
      saveMessages(convId, finalMsgs);
    }
  }, [input, isStreaming, messages, conversationId, user, saveMessages]);

  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
      setConversationId(convId);
    }
    setShowHistory(false);
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  }, []);

  const copyMessage = useCallback((idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); toast.error("Voice input failed"); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const suggestions = [
    "Explain quadratic equations simply",
    "What causes photosynthesis?",
    "Summarize the French Revolution",
    "Help me with Python loops",
  ];

  return (
    <div className="flex h-[100dvh] flex-col animate-fade-in">
      <Header
        title="AI Tutor"
        showBack
        rightAction={
          <div className="flex items-center gap-1">
            <button onClick={newChat} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
              <History className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        }
      />

      {/* History sidebar */}
      {showHistory && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col border-l border-border bg-card shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold text-foreground">Chat History</h3>
              <button onClick={() => setShowHistory(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {!user && <p className="p-4 text-sm text-muted-foreground">Sign in to save chat history</p>}
                {conversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={cn(
                      "w-full truncate rounded-lg p-3 text-left text-sm transition-colors hover:bg-secondary",
                      conversationId === c.id && "bg-secondary"
                    )}
                  >
                    <p className="truncate font-medium text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">How can I help?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Ask any question to get started</p>
            <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}
                  {msg.role === "assistant" && !isStreaming && (
                    <button
                      onClick={() => copyMessage(idx, msg.content)}
                      className="absolute -bottom-6 right-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedIdx === idx ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedIdx === idx ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 safe-bottom">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <button
            onClick={toggleVoice}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
              isListening ? "bg-destructive text-destructive-foreground" : "hover:bg-secondary text-muted-foreground"
            )}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
