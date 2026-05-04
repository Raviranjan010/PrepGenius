import { UserAnswer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CircleCheck, MessageSquare, Activity, Gauge, AlertTriangle, TrendingUp } from "lucide-react";

interface ReplayAnnotationCardProps {
  feedback: UserAnswer;
  index: number;
}

const FILLER_WORDS = [
  "um", "uh", "uhh", "umm", "like", "you know", "basically",
  "actually", "sort of", "kind of", "i mean", "right", "so yeah",
  "literally", "honestly"
];

const highlightFillerWords = (text: string): JSX.Element[] => {
  if (!text) return [<span key="empty"></span>];

  const parts: JSX.Element[] = [];
  const remaining = text;
  let keyIndex = 0;

  // Simple highlight: scan for filler words and wrap them
  const regex = new RegExp(`\\b(${FILLER_WORDS.join("|")})\\b`, "gi");
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={keyIndex++}>{remaining.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span key={keyIndex++} className="bg-red-500/20 text-red-400 px-0.5 rounded font-medium">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(<span key={keyIndex++}>{remaining.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key="fallback">{text}</span>];
};

const getRatingColor = (rating: number): string => {
  if (rating >= 7) return "text-emerald-400";
  if (rating >= 4) return "text-yellow-400";
  return "text-red-400";
};

const getRatingBg = (rating: number): string => {
  if (rating >= 7) return "bg-emerald-500/10 border-emerald-500/20";
  if (rating >= 4) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
};

export const ReplayAnnotationCard = ({ feedback, index }: ReplayAnnotationCardProps) => {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
              Q{index + 1}
            </span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${getRatingBg(feedback.rating)}`}>
              <Star className={`w-3 h-3 ${getRatingColor(feedback.rating)}`} />
              <span className={`text-xs font-bold ${getRatingColor(feedback.rating)}`}>
                {feedback.rating}/10
              </span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground leading-snug">
            {feedback.question}
          </h3>
        </div>
      </div>

      {/* Communication Metrics */}
      {(feedback.avgWPM || feedback.fillerCount || feedback.confidenceScore) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-border/20">
            <Gauge className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Pace</p>
              <p className="text-sm font-bold text-foreground">{feedback.avgWPM || 0} WPM</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-border/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Fillers</p>
              <p className="text-sm font-bold text-foreground">{feedback.fillerCount || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-border/20">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-bold text-foreground">{feedback.confidenceScore || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Your Answer (with filler highlights) */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-400">Your Answer</h4>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {highlightFillerWords(feedback.user_ans)}
          </p>
        </CardContent>
      </Card>

      {/* Expected Answer */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CircleCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-emerald-400">Expected Answer</h4>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {feedback.correct_ans}
          </p>
        </CardContent>
      </Card>

      {/* AI Coach Notes */}
      <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-emerald-400">AI Coach Notes</h4>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {feedback.feedback}
          </p>
          {feedback.communicationFeedback && (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/20">
              📊 {feedback.communicationFeedback}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
