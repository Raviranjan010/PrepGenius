import { Lightbulb, Target, TrendingUp, Zap } from "lucide-react";
import { UserStats, Interview } from "@/types";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RoadmapItem {
  title: string;
  description: string;
  icon: any;
  priority: "high" | "medium" | "low";
}

export const PreparationRoadmap = ({ stats, interviews }: { stats: UserStats | null; interviews: Interview[] }) => {
  const roadmap = useMemo(() => {
    const items: RoadmapItem[] = [];

    if (!interviews.length) {
      items.push({
        title: "Initialize Baseline",
        description: "Deploy your first mock interview to calibrate the assessment engine.",
        icon: Target,
        priority: "high",
      });
    }

    if (stats && stats.avgScore < 5 && interviews.length > 0) {
      items.push({
        title: "Core Optimization",
        description: "Proficiency is below threshold. Focus on foundational technical concepts.",
        icon: Lightbulb,
        priority: "high",
      });
    }

    if (stats && stats.currentStreak < 3) {
      items.push({
        title: "Operational Consistency",
        description: "Maintain a 3-day simulation streak to optimize neural retention.",
        icon: TrendingUp,
        priority: "medium",
      });
    }

    const latestPos = interviews[0]?.position;
    if (latestPos) {
      items.push({
        title: `${latestPos} Specialization`,
        description: `Execute deep-dive sessions for ${latestPos} specific domains.`,
        icon: Zap,
        priority: "low",
      });
    }

    return items;
  }, [stats, interviews]);

  if (roadmap.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Roadmap</h3>
      </div>
      <div className="grid gap-4">
        {roadmap.map((item, i) => (
          <div key={i} className="glass-card rounded-[1.5rem] p-5 flex gap-5 items-start group relative overflow-hidden">
            <div className={cn(
                "p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                item.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-primary/10 text-primary border border-primary/20"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</h4>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
