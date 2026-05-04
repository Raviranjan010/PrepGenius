import WebCam from "react-webcam";
import {
  CircleStop,
  FileText,
  Loader,
  MessageSquareText,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";

import useSpeechToText, { ResultType } from "react-hook-speech-to-text";

import { TooltipButton } from "@/components/tooltip-button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { chatSession } from "@/scripts/ai-studio";
import { SaveModal } from "@/components/save-modal";
import {
  addDoc,
  collection,
  doc,
  limit,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import { CommunicationPanel } from "./communication-panel";
import { analyzeCommunication } from "@/lib/communication-analyzer";
import { CommunicationMetrics, InterviewQuestion } from "@/types";


interface RecordAnswerProps {
  question: InterviewQuestion;
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [savedAnswerId, setSavedAnswerId] = useState<string | null>(null);
  const [hasLoadedSavedAnswer, setHasLoadedSavedAnswer] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commMetrics, setCommMetrics] = useState<CommunicationMetrics | null>(null);
  const recordingStartTime = useRef<number>(0);

  const { userId } = useAuth();
  const { interviewId } = useParams();
  const draftKey =
    userId && interviewId
      ? `prepg_draft_${userId}_${interviewId}_${question.question}`
      : "";

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      // Analyze communication metrics
      const elapsedSeconds = (Date.now() - recordingStartTime.current) / 1000;
      const metrics = analyzeCommunication(userAnswer, elapsedSeconds);
      setCommMetrics(metrics);
      toast.success("Recording stopped", {
        description: "Review your answer, then generate feedback when you are ready.",
      });
    } else {
      recordingStartTime.current = Date.now();
      setCommMetrics(null);
      startSpeechToText();
    }
  };

  const generateFeedback = async () => {
    if (userAnswer.trim().length < 30) {
      toast.error("Answer is too short", {
        description: "Write or record at least 30 characters before requesting feedback.",
      });
      return;
    }

    const elapsedSeconds = recordingStartTime.current
      ? (Date.now() - recordingStartTime.current) / 1000
      : Math.max(20, userAnswer.trim().split(/\s+/).length / 2);
    const metrics = analyzeCommunication(userAnswer, elapsedSeconds);
    setCommMetrics(metrics);

    const result = await generateResult(
      question.question,
      question.answer,
      userAnswer
    );

    setAiResult(result);
    toast.success("Feedback generated", {
      description: "Review it below, then save or update your answer.",
    });
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);

    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null);
    setCommMetrics(null);
    stopSpeechToText();
    recordingStartTime.current = Date.now();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!userId || !interviewId) {
      toast.error("Unable to save", {
        description: "Please sign in and open a valid interview.",
      });
      setLoading(false);
      return;
    }

    if (userAnswer.trim().length < 30) {
      toast.error("Answer is too short", {
        description: "Write or record at least 30 characters before saving.",
      });
      setLoading(false);
      return;
    }

    const currentQuestion = question.question;

    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("mockIdRef", "==", interviewId),
        where("question", "==", currentQuestion),
        limit(1)
      );

      const querySnap = await getDocs(userAnswerQuery);
      const payload = {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult?.feedback ?? "",
        rating: aiResult?.ratings ?? 0,
        userId,
        fillerCount: commMetrics?.fillerCount ?? 0,
        avgWPM: commMetrics?.avgWPM ?? 0,
        confidenceScore: commMetrics?.confidenceScore ?? 0,
        communicationFeedback: commMetrics
          ? `Speaking pace: ${commMetrics.avgWPM} WPM, Filler words: ${commMetrics.fillerCount}, Confidence: ${commMetrics.confidenceScore}%`
          : "",
        updatedAt: serverTimestamp(),
      };

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        const existingDoc = querySnap.docs[0];
        await updateDoc(doc(db, "userAnswers", existingDoc.id), payload);
        setSavedAnswerId(existingDoc.id);
        toast.success("Answer updated", {
          description: "Your latest response has been saved.",
        });
      } else {
        // save the answer with communication metrics

        const questionAnswerRef = await addDoc(collection(db, "userAnswers"), {
          ...payload,
          createdAt: serverTimestamp(),
        });

        const id = questionAnswerRef.id;
        setSavedAnswerId(id);

        await updateDoc(doc(db, "userAnswers", id), {
          id,
          updatedAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      stopSpeechToText();
      if (draftKey) localStorage.removeItem(draftKey);
    } catch (error) {
      toast("Error", {
        description: "An error occurred while saving your answer.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // Update communication metrics in real-time while recording
  useEffect(() => {
    if (isRecording && userAnswer.length > 10) {
      const elapsedSeconds = (Date.now() - recordingStartTime.current) / 1000;
      if (elapsedSeconds > 2) {
        const metrics = analyzeCommunication(userAnswer, elapsedSeconds);
        setCommMetrics(metrics);
      }
    }
  }, [userAnswer, isRecording]);

  useEffect(() => {
    if (!draftKey || !hasLoadedSavedAnswer || savedAnswerId) return;
    localStorage.setItem(draftKey, userAnswer);
  }, [draftKey, hasLoadedSavedAnswer, savedAnswerId, userAnswer]);

  useEffect(() => {
    const loadSavedAnswer = async () => {
      if (!userId || !interviewId) return;

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("mockIdRef", "==", interviewId),
        where("question", "==", question.question),
        limit(1)
      );

      const querySnap = await getDocs(userAnswerQuery);
      if (!querySnap.empty) {
        const answerDoc = querySnap.docs[0];
        const saved = answerDoc.data();
        setSavedAnswerId(answerDoc.id);
        setUserAnswer(saved.user_ans ?? "");
        setAiResult(
          saved.feedback || saved.rating
            ? { feedback: saved.feedback ?? "", ratings: saved.rating ?? 0 }
            : null
        );
        setCommMetrics({
          fillerCount: saved.fillerCount ?? 0,
          avgWPM: saved.avgWPM ?? 0,
          confidenceScore: saved.confidenceScore ?? 0,
          fillerWords: [],
          paceSamples: [],
        });
      } else if (draftKey) {
        setUserAnswer(localStorage.getItem(draftKey) ?? "");
      }
      setHasLoadedSavedAnswer(true);
    };

    loadSavedAnswer().catch((error) => {
      console.error(error);
      setHasLoadedSavedAnswer(true);
    });
  }, [draftKey, interviewId, question.question, userId]);

  useEffect(() => {
    // combine all transcripts into a single answers
    const combinedTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer((current) => {
      const typedPrefix = isRecording ? "" : current;
      return `${typedPrefix}${typedPrefix && combinedTranscripts ? " " : ""}${combinedTranscripts}`.trim();
    });
  }, [isRecording, results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4 animate-fade-in">
      {/* save modal */}

      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Webcam area */}
        <div className="flex-1">
          <div className="relative w-full h-[400px] flex flex-col items-center justify-center border border-border/50 bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
            {isWebCam ? (
              <>
                <WebCam
                  onUserMedia={() => setIsWebCam(true)}
                  onUserMediaError={() => setIsWebCam(false)}
                  className="w-full h-full object-cover z-10"
                />
                {/* Recording Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-white tracking-wider">REC</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <WebcamIcon className="w-16 h-16 opacity-50" />
                <p className="text-sm font-medium tracking-wide">Webcam Disabled</p>
              </div>
            )}
          </div>
        </div>

        {/* Communication Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <CommunicationPanel
            metrics={commMetrics}
            isRecording={isRecording}
          />
        </div>
      </div>

      {/* action buttons group */}
      <div className="flex items-center justify-center gap-4 glass px-6 py-4 rounded-full shadow-lg">
        <TooltipButton
          content={isWebCam ? "Turn Off Camera" : "Turn On Camera"}
          icon={
            isWebCam ? (
              <VideoOff className="w-5 h-5 text-emerald-400" />
            ) : (
              <Video className="w-5 h-5 text-muted-foreground" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <div className="w-px h-6 bg-border/50 mx-2" />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="w-6 h-6 text-red-500 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6 text-emerald-400" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Clear and Record Again"
          icon={<RefreshCw className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
          onClick={recordNewAnswer}
        />

        <div className="w-px h-6 bg-border/50 mx-2" />

        <TooltipButton
          content="Generate Feedback"
          icon={
            isAiGenerating ? (
              <Loader className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <MessageSquareText className="w-5 h-5 text-emerald-400" />
            )
          }
          onClick={generateFeedback}
          disbaled={isAiGenerating || userAnswer.trim().length < 30}
        />

        <TooltipButton
          content={savedAnswerId ? "Update Answer" : "Save Answer"}
          icon={
            loading ? (
              <Loader className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <Save className={`w-5 h-5 ${userAnswer.trim().length >= 30 ? 'text-emerald-400' : 'text-muted-foreground'}`} />
            )
          }
          onClick={() => setOpen(!open)}
          disbaled={userAnswer.trim().length < 30}
        />
      </div>

      <div className="w-full mt-6 p-6 border border-border/50 rounded-2xl glass-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full" />
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-400">Your Answer</h2>
          {savedAnswerId && <span className="text-xs text-muted-foreground">Saved</span>}
        </div>
        <textarea
          value={userAnswer}
          onChange={(event) => {
            setUserAnswer(event.target.value);
            setAiResult(null);
            setSavedAnswerId(null);
          }}
          className="min-h-36 w-full resize-y rounded-xl border border-border/40 bg-background/70 p-4 text-base leading-relaxed text-foreground outline-none focus:border-emerald-500"
          placeholder="Record your answer or type it here. Your draft stays on this question while you move between questions."
        />

        {interimResult && (
          <p className="text-sm text-muted-foreground/60 mt-4 italic flex items-center gap-2">
            <Loader className="w-3 h-3 animate-spin" />
            {interimResult}
          </p>
        )}

        {aiResult && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-emerald-500">Generated Feedback</h3>
              <span className="rounded-md border border-emerald-500/30 px-2 py-1 text-xs font-semibold text-emerald-500">
                {aiResult.ratings}/10
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground/80">{aiResult.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
