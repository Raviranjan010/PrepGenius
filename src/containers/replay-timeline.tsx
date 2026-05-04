import { UserAnswer } from "@/types";
import { useState } from "react";

interface ReplayTimelineProps {
  feedbacks: UserAnswer[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 7) return "#10b981";
  if (rating >= 4) return "#eab308";
  return "#ef4444";
};

const getRatingLabel = (rating: number): string => {
  if (rating >= 7) return "Strong";
  if (rating >= 4) return "Average";
  return "Needs Work";
};

export const ReplayTimeline = ({
  feedbacks,
  activeIndex,
  onSelectIndex,
}: ReplayTimelineProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (feedbacks.length === 0) return null;

  const totalSegments = feedbacks.length;

  return (
    <div className="w-full space-y-4">
      {/* Timeline bar */}
      <div className="relative w-full">
        {/* Track */}
        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex">
          {feedbacks.map((fb, i) => (
            <div
              key={fb.id || i}
              className="relative h-full cursor-pointer transition-all duration-300 group"
              style={{
                width: `${100 / totalSegments}%`,
                backgroundColor: getRatingColor(fb.rating),
                opacity: activeIndex === i ? 1 : 0.6,
              }}
              onClick={() => onSelectIndex(i)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Active indicator */}
              {activeIndex === i && (
                <div className="absolute inset-0 ring-2 ring-white/50 rounded-sm" />
              )}

              {/* Hover tooltip */}
              {hoveredIndex === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 animate-scale-in">
                  <div className="bg-card border border-border/50 rounded-xl p-3 shadow-xl min-w-[200px] max-w-[280px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        Q{i + 1}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getRatingColor(fb.rating)}20`,
                          color: getRatingColor(fb.rating),
                        }}
                      >
                        {fb.rating}/10 — {getRatingLabel(fb.rating)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {fb.question}
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="w-3 h-3 bg-card border-r border-b border-border/50 rotate-45 mx-auto -mt-1.5" />
                </div>
              )}

              {/* Separator line */}
              {i < totalSegments - 1 && (
                <div className="absolute right-0 top-0 h-full w-px bg-background/50" />
              )}
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{
            left: `${(activeIndex / totalSegments) * 100 + 100 / totalSegments / 2}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-lg shadow-white/20 playhead flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Question labels */}
      <div className="flex w-full">
        {feedbacks.map((_, i) => (
          <button
            key={i}
            onClick={() => onSelectIndex(i)}
            className={`flex-1 text-center text-[10px] font-medium uppercase tracking-wider transition-colors ${
              activeIndex === i ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            Q{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
