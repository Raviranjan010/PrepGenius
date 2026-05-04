import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Clock3,
  Code2,
  MessageSquareText,
  Play,
  Plus,
  Trophy,
  Activity,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";

import { UserAnswer } from "@/types";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/use-stats";
import { PreparationRoadmap } from "@/components/preparation-roadmap";

function timestampToMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  const parsed = new Date(value as string | number | Date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: unknown): string {
  const millis = timestampToMillis(value);
  if (!millis) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(millis));
}

function getInitials(firstName?: string | null, lastName?: string | null, username?: string | null) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return initials || username?.slice(0, 2).toUpperCase() || "PG";
}

export const Dashboard = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  
  const { stats, interviews, answers, loading } = useStats(userId, {
    fullName: user?.fullName,
    firstName: user?.firstName,
    imageUrl: user?.imageUrl,
  });

  const answersByInterview = useMemo(() => {
    return answers.reduce<Record<string, UserAnswer[]>>((acc, answer) => {
      if (!acc[answer.mockIdRef]) acc[answer.mockIdRef] = [];
      acc[answer.mockIdRef].push(answer);
      return acc;
    }, {});
  }, [answers]);

  const latestInterview = interviews[0];

  const scoreHistory = useMemo(() => {
    return [...answers]
      .filter((answer) => typeof answer.rating === "number" && answer.rating > 0)
      .sort((a, b) => timestampToMillis(a.createdAt) - timestampToMillis(b.createdAt))
      .slice(-10);
  }, [answers]);

  const communication = useMemo(() => {
    const withWpm = answers.filter((answer) => answer.avgWPM && answer.avgWPM > 0);
    const withConfidence = answers.filter((answer) => answer.confidenceScore && answer.confidenceScore > 0);
    const totalFillers = answers.reduce((sum, answer) => sum + (answer.fillerCount ?? 0), 0);

    return {
      avgWpm: withWpm.length
        ? Math.round(withWpm.reduce((sum, answer) => sum + (answer.avgWPM ?? 0), 0) / withWpm.length)
        : null,
      confidence: withConfidence.length
        ? Math.round(withConfidence.reduce((sum, answer) => sum + (answer.confidenceScore ?? 0), 0) / withConfidence.length)
        : null,
      totalFillers,
      hasMetrics: withWpm.length > 0 || withConfidence.length > 0 || totalFillers > 0,
    };
  }, [answers]);

  const firstName = user?.firstName ?? "there";

  return (
    <div className="min-h-screen pb-12 animate-fade-in relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Header */}
      <section className="relative mx-4 mt-6 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/30 py-12 backdrop-blur-2xl shadow-[0_20px_70px_rgba(39,31,24,0.08)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-8 animate-slide-up">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-[2rem] bg-primary/20 blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/55 border border-white/80 text-2xl font-black text-primary shadow-xl">
                  {getInitials(user?.firstName, user?.lastName, user?.username)}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#3aa66a] border-4 border-white shadow-xl">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Practice Overview</p>
                <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                  Greetings, <span className="text-primary">{firstName}</span>.
                </h1>
                <p className="text-sm font-medium text-muted-foreground/80">Your interview confidence is up <span className="text-[#24824f] font-bold">14%</span> this week.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 animate-slide-up delay-100">
              <Link
                to="/generate/create"
                className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#111118] px-8 text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
              >
                <Plus className="h-5 w-5" />
                Create New Round
              </Link>
              {latestInterview && (
                <Link
                  to={`/generate/interview/${latestInterview.id}`}
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/75 bg-white/45 backdrop-blur-md px-8 text-sm font-black text-foreground transition-all hover:bg-white active:scale-95"
                >
                  <Play className="h-5 w-5 text-primary fill-primary/10" />
                  Resume Session
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 relative z-10">
        <div className="space-y-10">
          {/* Stats Grid */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard 
              label="Total Rounds" 
              value={loading ? "..." : interviews.length.toString()} 
              detail="System throughput" 
              icon={BrainCircuit}
              trend={<TrendingUp className="w-3 h-3 text-[#24824f]" />}
            />
            <StatCard 
              label="Mean Proficiency" 
              value={stats?.avgScore && stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "-"} 
              detail="System accuracy" 
              icon={BarChart3}
              color="text-[#24824f]"
            />
            <StatCard 
              label="Current Streak" 
              value={stats?.currentStreak && stats.currentStreak > 0 ? stats.currentStreak.toString() : "-"} 
              detail="Consistency index" 
              icon={Clock3}
              isStreak
            />
            <StatCard 
              label="Global Ranking" 
              value={loading ? "..." : "#128"} 
              detail="Top 2% of engineers" 
              icon={Trophy}
              color="text-yellow-400"
            />
          </section>

          {/* Practice Workspace */}
          <section className="glass-card rounded-[1.75rem] overflow-hidden">
            <div className="flex flex-col gap-6 border-b border-white/70 p-8 sm:flex-row sm:items-center sm:justify-between bg-white/20">
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Intelligence Workspace
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">Manage and review your live simulation sessions.</p>
              </div>
              <div className="px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                Real-time Sync Active
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 p-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-40 animate-pulse rounded-2xl bg-white/35" />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center px-8 py-32 text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/5 border border-primary/10 shadow-inner">
                  <Plus className="h-10 w-10 text-primary opacity-50" />
                </div>
                <h3 className="text-3xl font-black tracking-tight">Zero active sessions.</h3>
                <p className="mt-3 max-w-sm text-muted-foreground font-medium leading-relaxed">
                  The system is idle. Initialize an AI-powered mock interview to begin your cognitive assessment.
                </p>
                <Link
                  to="/generate/create"
                  className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-10 text-sm font-black text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-110 active:scale-95"
                >
                  Create Mock Interview
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {interviews.map((interview) => {
                  const interviewAnswers = answersByInterview[interview.id] ?? [];
                  const average = interviewAnswers.length
                    ? interviewAnswers.reduce((sum, answer) => sum + (answer.rating || 0), 0) / interviewAnswers.length
                    : 0;
                  const questionCount = interview.questions?.length ?? 0;

                  return (
                    <article key={interview.id} className="group grid gap-8 p-8 transition-all hover:bg-white/[0.03] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                      <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <h3 className="text-xl font-black group-hover:text-primary transition-colors tracking-tight">{interview.position || "Simulation Round"}</h3>
                          <span className={cn(
                            "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] border",
                            interviewAnswers.length >= questionCount && questionCount > 0 
                              ? "border-[#7dbb95]/50 bg-[#dfeee2] text-[#1f5f42]" 
                              : "border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          )}>
                            {interviewAnswers.length >= questionCount && questionCount > 0 ? "Completed" : "In Progress"}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">{interview.description || "No parameters specified."}</p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge label={`${questionCount} Prompts`} />
                          <Badge label={`${interview.experience}Y Tier`} />
                          <Badge label={formatDate(interview.createdAt)} />
                          {(interview.resume?.trim() || interview.targetJD?.trim()) && (
                            <Badge label="Contextual Sync" variant="emerald" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-6 xl:items-end">
                        <div className="flex items-center gap-5">
                          <div className="text-right space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Proficiency</p>
                            <p className="text-3xl font-black text-foreground tracking-tighter">{average > 0 ? average.toFixed(1) : "0.0"}</p>
                          </div>
                          <div className="h-12 w-1.5 bg-white/45 rounded-full overflow-hidden border border-white/70 shadow-inner">
                            <div className="bg-primary w-full transition-all duration-1000" style={{ height: `${average * 10}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <ActionBtn to={`/generate/interview/${interview.id}`} icon={Play} label="Initialize" primary />
                          <ActionBtn to={`/generate/feedback/${interview.id}`} icon={MessageSquareText} label="Insights" />
                          <ActionBtn to={`/generate/interview/${interview.id}/code`} icon={Code2} label="Sandbox" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Performance Analytics */}
          <section className="glass-card rounded-[1.75rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <BarChart3 className="w-32 h-32 text-primary" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Vocal & Logic Analytics</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">Telemetry data from your last 10 simulation answers.</p>
              </div>
            </div>

            {scoreHistory.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-[1.5rem] bg-white/25">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Telemetry Available</p>
              </div>
            ) : (
              <div className="mt-14 flex h-56 items-end gap-4 border-b border-border/60 pb-6 relative z-10">
                {scoreHistory.map((answer, index) => (
                  <div key={`${answer.id}-${index}`} className="group relative flex flex-1 flex-col items-center gap-4">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-primary px-3 py-1 rounded-lg text-[10px] font-black shadow-xl shadow-primary/20 z-20">
                      {answer.rating}/10
                    </div>
                    <div
                      className="w-full rounded-t-2xl bg-primary/10 group-hover:bg-primary transition-all duration-700 relative overflow-hidden"
                      style={{ height: `${(answer.rating / 10) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-50" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">S-{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10 animate-fade-in delay-200">
          {/* Preparation Roadmap */}
          <PreparationRoadmap stats={stats} interviews={interviews} />

          {/* Quick Actions */}
          <section className="glass-card rounded-[1.75rem] p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Cognitive Metrics</h3>
            <div className="space-y-4">
              <MetricBox label="Avg. Cadence" value={communication.avgWpm ? `${communication.avgWpm} WPM` : "-"} icon={Zap} />
              <MetricBox label="Stability Index" value={communication.confidence ? `${communication.confidence}%` : "-"} icon={Activity} />
              <MetricBox label="Anomalies (Fillers)" value={communication.totalFillers.toString()} icon={MessageSquareText} />
            </div>
          </section>

          {/* Feature Access */}
          <section className="glass-card rounded-[1.75rem] p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">System Modules</h3>
            <div className="space-y-5">
              <FeatureItem label="AI Simulation" active={interviews.length > 0} count={interviews.length} />
              <FeatureItem label="Algorithmic Sandbox" active={answers.some(a => a.userCode)} count={answers.filter(a => a.userCode).length} />
              <FeatureItem label="Architect Whiteboard" active={false} count={0} />
              <FeatureItem label="Neural Replay" active={answers.length > 0} count={answers.length} />
            </div>
          </section>

          {/* Achievements */}
          <section className="glass-card rounded-[1.75rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 -rotate-12">
                <Trophy className="w-20 h-20 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Milestones</h3>
            </div>
            {stats?.badges.length === 0 ? (
              <div className="text-center py-6 border border-border/60 rounded-2xl bg-white/25">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No Achievements Logged</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {stats?.badges.slice(0, 4).map((badge) => (
                  <div key={badge} className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner group hover:scale-110 transition-transform cursor-help" title={badge}>
                    <Zap className="w-5 h-5 text-primary fill-primary/20 group-hover:fill-primary" />
                  </div>
                ))}
              </div>
            )}
            <Link to="/generate/stats" className="mt-8 block text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-all active:scale-95">
              View All Milestones →
            </Link>
          </section>
        </aside>
      </main>
    </div>
  );
};

/* Subcomponents */

function StatCard({ label, value, detail, icon: Icon, color = "text-primary", trend, isStreak }: any) {
  return (
    <article className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:bg-white/45">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <Icon className="w-20 h-20" />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
          <div className="p-2 rounded-xl bg-white/45 border border-white/70 group-hover:border-primary/25 group-hover:bg-primary/10 transition-all">
            <Icon className={cn("w-5 h-5", color)} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <p className={cn("text-4xl font-black tracking-tighter leading-none", isStreak && "streak-fire text-orange-400")}>{value}</p>
            {trend && <span className="mb-1">{trend}</span>}
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function Badge({ label, variant = "default" }: any) {
  return (
    <span className={cn(
      "rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all",
      variant === "emerald" 
        ? "border-[#7dbb95]/50 bg-[#dfeee2] text-[#1f5f42]" 
        : "border-white/70 bg-white/40 text-muted-foreground hover:border-primary/25"
    )}>
      {label}
    </span>
  );
}

function ActionBtn({ to, icon: Icon, label, primary }: any) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-xl px-5 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20",
        primary 
          ? "bg-[#111118] text-white shadow-black/20 hover:shadow-black/25" 
          : "border border-white/70 bg-white/45 text-foreground hover:bg-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function MetricBox({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/70 group hover:border-primary/25 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-black text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function FeatureItem({ label, active, count }: any) {
  return (
    <div className="flex items-center justify-between gap-4 px-2 group">
      <div className="flex items-center gap-4">
        <div className={cn(
            "h-2 w-2 rounded-full transition-all duration-500 group-hover:scale-150", 
            active ? "bg-primary shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-muted"
        )} />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      </div>
      {count > 0 && <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-md bg-primary/10">{count}</span>}
    </div>
  );
}
