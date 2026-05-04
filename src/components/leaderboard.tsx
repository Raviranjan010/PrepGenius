import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { UserStats } from "@/types";
import { Crown, Medal, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  currentUserId: string | null | undefined;
}

const RANK_ICONS: Record<number, JSX.Element> = {
  1: <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />,
  2: <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />,
  3: <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />,
};

export const Leaderboard = ({ currentUserId }: LeaderboardProps) => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, "userStats"),
          orderBy("avgScore", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => d.data() as UserStats);
        setUsers(data);
      } catch (error) {
        console.log("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Trophy className="w-16 h-16 text-primary/20 mb-4" />
        <h3 className="text-xl font-bold text-foreground">No rankings yet</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Complete interviews to earn scores and appear on the global leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="flex items-center gap-6 px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
        <span className="w-10 text-center">Rank</span>
        <span className="flex-1">Engineer</span>
        <span className="w-24 text-center">Rounds</span>
        <span className="w-24 text-center">Proficiency</span>
        <span className="w-24 text-center">Streak</span>
      </div>

      {users.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.userId === currentUserId;

        return (
          <div
            key={user.userId}
            className={cn(
              "leaderboard-row group relative overflow-hidden",
              isCurrentUser && "current-user border-primary/30 bg-primary/5"
            )}
          >
            {/* Background Glow for Top 3 */}
            {rank <= 3 && (
              <div className={cn(
                "absolute inset-y-0 left-0 w-1 opacity-50",
                rank === 1 && "bg-yellow-400",
                rank === 2 && "bg-slate-300",
                rank === 3 && "bg-amber-600"
              )} />
            )}

            {/* Rank */}
            <div className="w-10 flex items-center justify-center relative z-10">
              {RANK_ICONS[rank] || (
                <span className="text-sm font-black text-muted-foreground group-hover:text-foreground transition-colors">{rank}</span>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 flex items-center gap-4 min-w-0 relative z-10">
              <div className="relative">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-black text-primary">
                      {(user.displayName || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {isCurrentUser && (
                  <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border-2 border-background">
                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate flex items-center gap-2">
                  {user.displayName || "Anonymous Engineer"}
                  {isCurrentUser && <span className="text-[10px] font-black uppercase tracking-widest text-primary">YOU</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex -space-x-1">
                    {user.badges.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full bg-primary/20 border border-background" />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {user.badges.length} Elite Badges
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="w-24 text-center relative z-10">
              <span className="text-sm font-bold text-foreground">{user.totalInterviews}</span>
            </div>
            <div className="w-24 text-center relative z-10">
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-black border",
                user.avgScore >= 8 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : 
                user.avgScore >= 5 ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400" : 
                "border-red-500/20 bg-red-500/10 text-red-400"
              )}>
                {user.avgScore.toFixed(1)}
              </div>
            </div>
            <div className="w-24 text-center relative z-10">
              <div className="flex items-center justify-center gap-1.5">
                <span className={cn("text-sm font-bold", user.currentStreak > 0 ? "text-orange-400 streak-fire" : "text-muted-foreground")}>
                  {user.currentStreak > 0 ? user.currentStreak : "—"}
                </span>
                {user.currentStreak > 0 && <span className="text-[10px] font-bold text-orange-400/50 uppercase">DAYS</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
