import { useAuth, useUser } from "@clerk/clerk-react";
import { Flame, Trophy, BarChart3, Award, Zap, Activity as ActivityIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Headings } from "@/components/headings";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { Leaderboard } from "@/components/leaderboard";
import { AchievementBadges } from "@/components/achievement-badges";
import { useStats } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

export const GamificationPage = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  
  const { stats, loading } = useStats(userId, {
    fullName: user?.fullName,
    firstName: user?.firstName,
    imageUrl: user?.imageUrl,
  });

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in py-10 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <Headings
          title="Intelligence & Achievements"
          description="Track your cognitive progress, climb the global rankings, and unlock elite badges."
        />
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
          <Zap className="w-4 h-4 fill-primary" />
          Elite Member
        </div>
      </div>

      {/* Quick stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox 
            label="Day Streak" 
            value={stats.currentStreak} 
            icon={Flame} 
            color="text-orange-400" 
            bgColor="bg-orange-500/10" 
            isStreak 
          />
          <StatBox 
            label="Total Rounds" 
            value={stats.totalInterviews} 
            icon={ActivityIcon} 
            color="text-primary" 
            bgColor="bg-primary/10" 
          />
          <StatBox 
            label="Avg. Proficiency" 
            value={stats.avgScore.toFixed(1)} 
            icon={BarChart3} 
            color="text-blue-400" 
            bgColor="bg-blue-500/10" 
          />
          <StatBox 
            label="Elite Badges" 
            value={stats.badges.length} 
            icon={Award} 
            color="text-purple-400" 
            bgColor="bg-purple-500/10" 
          />
        </div>
      ) : null}

      {/* Main Content Tabs */}
      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="bg-card/50 border border-white/5 p-1.5 rounded-2xl backdrop-blur-md mb-8">
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-8 py-2.5 text-sm font-bold transition-all">
            Activity Matrix
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-8 py-2.5 text-sm font-bold transition-all">
            Global Rankings
          </TabsTrigger>
          <TabsTrigger value="badges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-8 py-2.5 text-sm font-bold transition-all">
            Badges & Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-0 outline-none animate-slide-up">
          <div className="glass-card rounded-3xl p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Contribution Heatmap</h3>
                <p className="text-sm text-muted-foreground mt-1">Your consistent practice over the last year.</p>
              </div>
              <Trophy className="w-6 h-6 text-primary/40" />
            </div>
            <ActivityHeatmap activeDays={stats?.activeDays || []} />
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0 outline-none animate-slide-up">
          <div className="glass-card rounded-3xl p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">World Leaderboard</h3>
                <p className="text-sm text-muted-foreground mt-1">See how you stack up against the top engineers.</p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400/40" />
            </div>
            <Leaderboard currentUserId={userId} />
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-0 outline-none animate-slide-up">
          <div className="glass-card rounded-3xl p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Unlocked Milestones</h3>
                <p className="text-sm text-muted-foreground mt-1">Proof of your dedication and expertise.</p>
              </div>
              <Award className="w-6 h-6 text-purple-400/40" />
            </div>
            <AchievementBadges
              unlockedBadges={stats?.badges || []}
              stats={{
                totalInterviews: stats?.totalInterviews || 0,
                currentStreak: stats?.currentStreak || 0,
                longestStreak: stats?.longestStreak || 0,
                avgScore: stats?.avgScore || 0,
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function StatBox({ label, value, icon: Icon, color, bgColor, isStreak }: any) {
  return (
    <div className="glass-card rounded-3xl p-6 border-white/5 group hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${color} ${isStreak ? "streak-fire" : ""}`} />
        </div>
        <div>
          <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
