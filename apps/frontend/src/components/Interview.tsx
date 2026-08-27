import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../lib/config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "system" | "user";
  content: string;
}

export default function InterviewPage({ sessionId }: { sessionId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/onboarding/question`, {
        sessionId,
      });
      const questionData = res.data.question;
      
      setCurrentQuestionId(questionData.id);
      setMessages((prev) => [
        ...prev,
        {
          id: questionData.id.toString(),
          role: "system",
          content: questionData.question,
        },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch next question");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !currentQuestionId) return;

    const answerText = inputValue.trim();
    setInputValue("");
    
    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: answerText,
      },
    ]);

    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/v1/onboarding/answer`, {
        questionId: currentQuestionId,
        answer: answerText,
      });
      
      setCurrentQuestionId(null);
      // Fetch next question after submitting answer
      await fetchNextQuestion();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit answer");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex-1 bg-card rounded-2xl shadow-sm border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Interviewer</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Active Session
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && isLoading && (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              Preparing your interview...
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && currentQuestionId === null && messages.length > 0 && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-muted text-foreground rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          <div className="flex items-end gap-2 max-w-3xl mx-auto relative">
            <textarea
              className="flex min-h-[60px] max-h-[200px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-14"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading || currentQuestionId === null}
              rows={1}
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 rounded-xl h-10 w-10 transition-transform active:scale-95" 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim() || currentQuestionId === null}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line. AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}