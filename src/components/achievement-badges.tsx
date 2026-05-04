import { BadgeWithIcon } from "@/types";
import { Award, Code, Flame, Zap, Target, Star, Trophy, Crown } from "lucide-react";

const BADGE_DEFINITIONS: BadgeWithIcon[] = [
  {
    id: "first_interview",
    title: "First Steps",
    description: "Complete your first mock interview",
    icon: <Star className="w-6 h-6" />,
    requirement: "totalInterviews",
    threshold: 1,
  },
  {
    id: "ten_interviews",
    title: "Dedicated Learner",
    description: "Complete 10 mock interviews",
    icon: <Target className="w-6 h-6" />,
    requirement: "totalInterviews",
    threshold: 10,
  },
  {
    id: "twenty_five_interviews",
    title: "Interview Pro",
    description: "Complete 25 mock interviews",
    icon: <Trophy className="w-6 h-6" />,
    requirement: "totalInterviews",
    threshold: 25,
  },
  {
    id: "five_day_streak",
    title: "On Fire",
    description: "Maintain a 5-day practice streak",
    icon: <Flame className="w-6 h-6" />,
    requirement: "currentStreak",
    threshold: 5,
  },
  {
    id: "consistency_king",
    title: "Consistency King",
    description: "Maintain a 30-day practice streak",
    icon: <Crown className="w-6 h-6" />,
    requirement: "longestStreak",
    threshold: 30,
  },
  {
    id: "perfect_score",
    title: "Perfect Score",
    description: "Achieve an average score of 9+/10",
    icon: <Zap className="w-6 h-6" />,
    requirement: "avgScore",
    threshold: 9,
  },
  {
    id: "code_warrior",
    title: "Code Warrior",
    description: "Complete your first coding interview",
    icon: <Code className="w-6 h-6" />,
    requirement: "codeSessions",
    threshold: 1,
  },
  {
    id: "architect",
    title: "System Architect",
    description: "Complete your first system design session",
    icon: <Award className="w-6 h-6" />,
    requirement: "systemDesigns",
    threshold: 1,
  },
];

interface AchievementBadgesProps {
  unlockedBadges: string[];
  stats: {
    totalInterviews: number;
    currentStreak: number;
    longestStreak: number;
    avgScore: number;
  };
}

function getProgress(badge: BadgeWithIcon, stats: AchievementBadgesProps["stats"]): number {
  let current = 0;
  switch (badge.requirement) {
    case "totalInterviews":
      current = stats.totalInterviews;
      break;
    case "currentStreak":
      current = stats.currentStreak;
      break;
    case "longestStreak":
      current = stats.longestStreak;
      break;
    case "avgScore":
      current = stats.avgScore;
      break;
    default:
      current = 0;
  }
  return Math.min(100, (current / badge.threshold) * 100);
}

export const AchievementBadges = ({ unlockedBadges, stats }: AchievementBadgesProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {BADGE_DEFINITIONS.map((badge) => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        const progress = getProgress(badge, stats);

        return (
          <div
            key={badge.id}
            className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 ${
              isUnlocked
                ? "badge-unlocked bg-emerald-500/5 border-emerald-500/30"
                : "badge-locked bg-white/[0.02] border-border/20"
            }`}
          >
            {/* Icon */}
            <div
              className={`p-3 rounded-xl mb-3 ${
                isUnlocked
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-muted-foreground/30"
              }`}
            >
              {badge.icon}
            </div>

            {/* Title */}
            <h4 className={`text-sm font-semibold mb-1 ${
              isUnlocked ? "text-foreground" : "text-muted-foreground/40"
            }`}>
              {badge.title}
            </h4>

            {/* Description */}
            <p className={`text-xs mb-3 ${
              isUnlocked ? "text-muted-foreground" : "text-muted-foreground/25"
            }`}>
              {badge.description}
            </p>

            {/* Progress bar */}
            {!isUnlocked && (
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/40 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Unlocked check */}
            {isUnlocked && (
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
