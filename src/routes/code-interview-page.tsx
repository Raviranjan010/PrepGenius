import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Clock, Play, ChevronDown, ArrowLeft, Save } from "lucide-react";

import { db } from "@/config/firebase.config";
import { chatSession } from "@/scripts/ai-studio";
import { Interview } from "@/types";
import { LoaderPage } from "@/views/loader-page";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/containers/code-editor";
import { AiChatPanel } from "@/containers/ai-chat-panel";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

const DEFAULT_CODE: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solution() {\n  \n}\n",
  typescript: "// Write your solution here\nfunction solution(): void {\n  \n}\n",
  python: "# Write your solution here\ndef solution():\n    pass\n",
  java: "// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n",
  cpp: "// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
};

const buildDraftKey = (userId: string | null | undefined, interviewId: string | undefined) =>
  userId && interviewId ? `prepg_code_session_${userId}_${interviewId}` : null;

export const CodeInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE["javascript"]);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; message: string; timestamp: number }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [output, setOutput] = useState<string>("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRef = useRef(code);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = buildDraftKey(userId, interviewId);

  // Keep codeRef in sync
  useEffect(() => { codeRef.current = code; }, [code]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Fetch interview and any saved coding session for this interview.
  useEffect(() => {
    if (!interviewId) { navigate("/generate", { replace: true }); return; }
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "interviews", interviewId));
        if (snap.exists()) {
          setInterview(snap.data() as Interview);
          if (userId) {
            const sessionQuery = query(
              collection(db, "codeSessions"),
              where("userId", "==", userId),
              where("interviewId", "==", interviewId),
              limit(1)
            );
            const sessionSnap = await getDocs(sessionQuery);
            if (!sessionSnap.empty) {
              const sessionDoc = sessionSnap.docs[0];
              const session = sessionDoc.data();
              const savedLanguage = session.language ?? "javascript";
              setSessionId(sessionDoc.id);
              setLanguage(savedLanguage);
              setCode(session.code ?? DEFAULT_CODE[savedLanguage]);
              setMessages(session.aiFollowUps ?? []);
              setElapsed(session.elapsedSeconds ?? 0);
            } else {
              const localDraft = draftKey ? localStorage.getItem(draftKey) : null;
              if (localDraft) {
                try {
                  const parsed = JSON.parse(localDraft);
                  const savedLanguage = parsed.language ?? "javascript";
                  setLanguage(savedLanguage);
                  setCode(parsed.code ?? DEFAULT_CODE[savedLanguage]);
                  setMessages(parsed.messages ?? []);
                  setElapsed(parsed.elapsed ?? 0);
                } catch {
                  if (draftKey) localStorage.removeItem(draftKey);
                }
              }
            }
          }
        } else {
          navigate("/generate", { replace: true });
        }
      } catch { toast.error("Failed to load interview"); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [draftKey, interviewId, navigate, userId]);

  useEffect(() => {
    if (!draftKey || isLoading) return;

    localStorage.setItem(
      draftKey,
      JSON.stringify({
        language,
        code,
        messages,
        elapsed,
        updatedAt: Date.now(),
      })
    );
  }, [code, draftKey, elapsed, isLoading, language, messages]);

  // Generate initial coding problem
  useEffect(() => {
    if (interview && messages.length === 0 && !sessionId) {
      generateProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview]);

  const generateProblem = async () => {
    if (!interview) return;
    setIsAiTyping(true);
    try {
      const prompt = `You are a senior technical interviewer. Generate one practical coding interview problem for a ${interview.position} position (${interview.experience} years experience) using ${interview.techStack}.

The problem should be:
- Medium difficulty
- Solvable in 20-30 minutes
- Relevant to real-world scenarios
- Clear enough that the candidate can start coding without extra explanation
- Rich enough to support follow-up questions about complexity, edge cases, and trade-offs

Format your response as:
Problem: [title]
Description: [clear paragraph]
Examples:
1. Input: [example input]
   Output: [expected output]
2. Input: [edge-case input]
   Output: [expected output]
Constraints: [short list]
Follow-up focus: [what you will evaluate]

Do not use markdown emphasis or asterisks. Do not provide the solution. Only the problem statement.`;

      const result = await chatSession.sendMessage(prompt);
      const text = result.response.text();
      setMessages([{ role: "ai", message: text, timestamp: Date.now() }]);
    } catch {
      setMessages([{
        role: "ai",
        message: "Welcome! I'll be your coding interviewer today. Please write your solution in the editor on the left. I'll review your code and ask follow-up questions as you work.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Debounced AI code analysis
  const analyzeCode = useCallback(async (codeSnapshot: string) => {
    if (codeSnapshot.trim().split("\n").length < 5 || isAiTyping) return;
    setIsAiTyping(true);
    try {
      const prompt = `You are reviewing code written by a candidate during a live coding interview for a ${interview?.position} role.

Their current code:
\`\`\`${language}
${codeSnapshot}
\`\`\`

Based on the code so far:
1. If there is an obvious bug or logical gap, give one subtle hint without solving it.
2. If the approach is reasonable, ask one sharper follow-up about complexity, data structures, edge cases, tests, or optimization.
3. If the code looks complete, ask for a quick dry run or a production edge case.
4. Rotate your focus so the questions do not feel repetitive.
5. Keep your response conversational and brief.

Do not use markdown emphasis, asterisks, or bullet-heavy formatting. Respond as a friendly but rigorous interviewer.`;

      const result = await chatSession.sendMessage(prompt);
      setMessages((prev) => [...prev, {
        role: "ai",
        message: result.response.text(),
        timestamp: Date.now(),
      }]);
    } catch { /* silently fail */ }
    finally { setIsAiTyping(false); }
  }, [interview, language, isAiTyping]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyzeCode(value), 8000); // 8s debounce
  };

  const handleSendMessage = async (userMsg: string) => {
    setMessages((prev) => [...prev, { role: "user", message: userMsg, timestamp: Date.now() }]);
    setIsAiTyping(true);
    try {
      const prompt = `You are a technical interviewer reviewing the candidate's code:
\`\`\`${language}
${codeRef.current}
\`\`\`

The candidate says: "${userMsg}"

Respond as a friendly interviewer. Keep it brief. Ask one useful follow-up question when appropriate. Do not use markdown emphasis or asterisks.`;

      const result = await chatSession.sendMessage(prompt);
      setMessages((prev) => [...prev, {
        role: "ai",
        message: result.response.text(),
        timestamp: Date.now(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "ai",
        message: "I see. Could you elaborate on that approach?",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Run code (JS only)
  const runCode = () => {
    if (language !== "javascript" && language !== "typescript") {
      setOutput(`Local execution is only available for JavaScript.\nFor ${LANGUAGES.find(l => l.value === language)?.label}, please describe your expected output in the chat.`);
      return;
    }
    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) };
      const fn = new Function("console", code);
      fn(mockConsole);
      setOutput(logs.length > 0 ? logs.join("\n") : "(No output)");
    } catch (err) {
      setOutput(`Error: ${(err as Error).message}`);
    }
  };

  // Save session
  const saveSession = async () => {
    if (!userId || !interviewId) return;
    setIsSaving(true);
    try {
      const payload = {
        interviewId,
        userId,
        language,
        code,
        problemStatement: messages[0]?.message || "",
        aiFollowUps: messages,
        elapsedSeconds: elapsed,
        updatedAt: serverTimestamp(),
      };

      if (sessionId) {
        await updateDoc(doc(db, "codeSessions", sessionId), payload);
        toast.success("Session updated!");
      } else {
        const ref = await addDoc(collection(db, "codeSessions"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setSessionId(ref.id);
        await updateDoc(doc(db, "codeSessions", ref.id), { id: ref.id });
        toast.success("Session saved!");
      }
      if (draftKey) localStorage.removeItem(draftKey);
    } catch { toast.error("Failed to save session"); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-black/20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="h-5 w-px bg-border/50" />

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border/30 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {LANGUAGES.find((l) => l.value === language)?.label}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border/50 rounded-lg shadow-xl overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => { setLanguage(lang.value); setCode(DEFAULT_CODE[lang.value]); setShowLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${
                      language === lang.value ? "text-emerald-400 bg-emerald-500/10" : "text-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border/30 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-foreground">{formatTime(elapsed)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={runCode}>
            <Play className="w-3.5 h-3.5 mr-1" /> Run
          </Button>
          <Button size="sm" onClick={saveSession} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" /> {isSaving ? "Saving..." : sessionId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeEditor
              language={language}
              initialCode={DEFAULT_CODE[language]}
              value={code}
              onChange={handleCodeChange}
            />
          </div>
          {/* Output Panel */}
          {output && (
            <div className="h-32 border-t border-border/30 bg-black/60 p-3 overflow-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Output</span>
                <button onClick={() => setOutput("")} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
              <pre className="text-sm font-mono text-foreground/80 whitespace-pre-wrap">{output}</pre>
            </div>
          )}
        </div>

        {/* Right: AI Chat */}
        <div className="w-96 border-l border-border/30">
          <AiChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isAiTyping}
          />
        </div>
      </div>
    </div>
  );
};
