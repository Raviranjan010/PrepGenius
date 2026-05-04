import { CommunicationMetrics } from "@/types";
import { Activity, AlertTriangle, Gauge, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CommunicationPanelProps {
  metrics: CommunicationMetrics | null;
  isRecording: boolean;
}

const RadialGauge = ({
  value,
  max,
  label,
  color,
  unit,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  unit?: string;
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-white/5"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{value}</span>
          {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

const getConfidenceColor = (score: number): string => {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#eab308";
  return "#ef4444";
};

const getPaceColor = (wpm: number): string => {
  if (wpm >= 120 && wpm <= 170) return "#10b981";
  if (wpm >= 90 && wpm <= 200) return "#eab308";
  return "#ef4444";
};

const getFillerColor = (count: number): string => {
  if (count <= 2) return "#10b981";
  if (count <= 5) return "#eab308";
  return "#ef4444";
};

export const CommunicationPanel = ({ metrics, isRecording }: CommunicationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!metrics && !isRecording) return null;

  const fillerCount = metrics?.fillerCount ?? 0;
  const avgWPM = metrics?.avgWPM ?? 0;
  const confidenceScore = metrics?.confidenceScore ?? 0;

  return (
    <div className="w-full glass-card rounded-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">Communication Coach</h3>
            <p className="text-xs text-muted-foreground">
              {isRecording ? "Analyzing in real-time..." : "Session Summary"}
            </p>
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Body */}
      {isExpanded && (
        <div className="px-4 pb-5 space-y-5">
          {/* Gauges row */}
          <div className="flex items-center justify-around">
            <RadialGauge
              value={avgWPM}
              max={200}
              label="Pace"
              color={getPaceColor(avgWPM)}
              unit="WPM"
            />
            <RadialGauge
              value={fillerCount}
              max={15}
              label="Fillers"
              color={getFillerColor(fillerCount)}
            />
            <RadialGauge
              value={confidenceScore}
              max={100}
              label="Confidence"
              color={getConfidenceColor(confidenceScore)}
              unit="%"
            />
          </div>

          {/* Filler words breakdown */}
          {metrics && metrics.fillerWords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Detected Filler Words
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.fillerWords.map((fw) => (
                  <span
                    key={fw.word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs"
                  >
                    <span className="text-red-400 font-medium">"{fw.word}"</span>
                    <span className="text-red-300/70">×{fw.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick tips */}
          {metrics && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Tips
                </span>
              </div>
              <div className="space-y-1.5">
                {avgWPM < 110 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Gauge className="w-3 h-3 mt-0.5 text-yellow-500 shrink-0" />
                    Try speaking a bit faster. Your pace is below the ideal range (120-170 WPM).
                  </p>
                )}
                {avgWPM > 180 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Gauge className="w-3 h-3 mt-0.5 text-yellow-500 shrink-0" />
                    Slow down slightly. Speaking too fast can reduce clarity.
                  </p>
                )}
                {fillerCount > 3 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 mt-0.5 text-orange-500 shrink-0" />
                    Try pausing instead of using filler words. A brief silence shows confidence.
                  </p>
                )}
                {confidenceScore >= 70 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <TrendingUp className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
                    Great job! Your delivery shows strong confidence.
                  </p>
                )}
                {confidenceScore < 40 && (
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <TrendingUp className="w-3 h-3 mt-0.5 text-red-500 shrink-0" />
                    Focus on structuring your answer before speaking. Use the STAR method.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
