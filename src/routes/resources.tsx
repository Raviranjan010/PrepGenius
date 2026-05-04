import { Headings } from "@/components/headings";
import { BookOpen, CheckCircle2, MessageSquare, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Resources = () => {
  const tips = [
    {
      title: "STAR Methodology",
      description: "Situation, Task, Action, Result. The industry-standard framework for articulating behavioral responses with precision.",
      icon: Target,
      color: "text-[#1f5f42]",
      bg: "bg-[#dcebe1]",
    },
    {
      title: "Cognitive Processing",
      description: "Active listening is key. Absorb the interviewer's nuances and pause to structure your thoughts for high-impact delivery.",
      icon: MessageSquare,
      color: "text-[#9a4318]",
      bg: "bg-[#ffdec8]",
    },
    {
      title: "Strategic Research",
      description: "Dive deep into the company's technical architecture and core values. Align your narrative with their long-term vision.",
      icon: BookOpen,
      color: "text-[#4f2f83]",
      bg: "bg-[#e4d3f7]",
    },
    {
      title: "Iterative Practice",
      description: "Simulate high-pressure scenarios using our advanced AI to desensitize anxiety and sharpen your technical reflexes.",
      icon: CheckCircle2,
      color: "text-[#7b5510]",
      bg: "bg-[#ffe8ad]",
    }
  ];

  return (
    <div className="flex flex-col gap-10 w-full animate-fade-in py-12 px-4 max-w-7xl mx-auto">
      <div className="space-y-4">
        <Headings
          title="Elite Preparation Resources"
          description="Master the methodologies used by the top 1% of engineers to secure Big Tech offers."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tips.map((tip, i) => (
          <div key={i} className="glass-card group p-8 rounded-2xl hover:border-primary/25 transition-all duration-500">
            <div className="flex items-start gap-6">
              <div className={cn("p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform", tip.bg)}>
                <tip.icon className={cn("w-6 h-6", tip.color)} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative overflow-hidden p-10 glass-card rounded-[1.75rem]">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            Pro Intel
          </div>
          <h3 className="text-3xl font-black tracking-tight text-foreground">Optimizing Your Signal</h3>
          <p className="text-muted-foreground leading-relaxed text-lg font-medium">
            Virtual interviews are 50% delivery. Ensure your audio is crisp and your lighting is professional. A clear signal allows our AI (and real interviewers) to focus entirely on the quality of your insights without cognitive load.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
             <div className="flex items-center gap-2 text-xs font-bold text-[#1f5f42]">
                <CheckCircle2 className="w-4 h-4" />
                Balanced Front-Lighting
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
                Dedicated Audio Hardware
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <CheckCircle2 className="w-4 h-4" />
                Zero-Latency Environment
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
