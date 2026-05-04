import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { UserStats, Interview, UserAnswer } from "@/types";

/**
 * Calculate streak data from interview dates
 */
export function calculateStreaks(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
  activeDays: string[];
} {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, activeDays: [] };

  // Dedupe and sort dates
  const uniqueDates = [...new Set(dates)].sort();
  const activeDays = uniqueDates;

  // Calculate current streak (from today going backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check if user practiced today or yesterday
  const lastDate = uniqueDates[uniqueDates.length - 1];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastDate !== todayStr && lastDate !== yesterdayStr) {
    currentStreak = 0;
  } else {
    if (lastDate === yesterdayStr && lastDate !== todayStr) {
      checkDate = yesterday;
    }
    
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak, activeDays };
}

/**
 * Compute user stats from local data (interviews + answers)
 */
export function computeStatsFromData(
  userId: string,
  interviews: Interview[],
  answers: UserAnswer[]
): UserStats {
  const interviewDates: string[] = interviews
    .map((int) => {
      if (!int.createdAt) return null;
      const date = (int.createdAt as any).toDate 
        ? (int.createdAt as any).toDate() 
        : new Date(int.createdAt as any);
      return date.toISOString().split("T")[0];
    })
    .filter(Boolean) as string[];

  let totalRating = 0;
  let ratingCount = 0;
  answers.forEach((ans) => {
    if (ans.rating) {
      totalRating += ans.rating;
      ratingCount++;
    }
  });

  const avgScore = ratingCount > 0 ? totalRating / ratingCount : 0;
  const { currentStreak, longestStreak, activeDays } = calculateStreaks(interviewDates);

  // Determine badges
  const badges: string[] = [];
  const totalInterviews = interviews.length;

  if (totalInterviews >= 1) badges.push("first_interview");
  if (totalInterviews >= 10) badges.push("ten_interviews");
  if (totalInterviews >= 25) badges.push("twenty_five_interviews");
  if (currentStreak >= 5) badges.push("five_day_streak");
  if (longestStreak >= 30) badges.push("consistency_king");
  if (avgScore >= 9) badges.push("perfect_score");

  return {
    userId,
    displayName: "",
    imageUrl: "",
    currentStreak,
    longestStreak,
    totalInterviews,
    avgScore: Math.round(avgScore * 10) / 10,
    activeDays,
    badges,
    updatedAt: serverTimestamp(),
  };
}

/**
 * Fetch and compute user stats from Firestore (Legacy/Backend support)
 */
export async function computeUserStats(userId: string): Promise<UserStats> {
  // Fetch all interviews by user
  const interviewQuery = query(
    collection(db, "interviews"),
    where("userId", "==", userId)
  );
  const interviewSnap = await getDocs(interviewQuery);
  const interviews = interviewSnap.docs.map(d => d.data() as Interview);

  // Fetch all answers by user
  const answersQuery = query(
    collection(db, "userAnswers"),
    where("userId", "==", userId)
  );
  const answersSnap = await getDocs(answersQuery);
  const answers = answersSnap.docs.map(d => d.data() as UserAnswer);

  const stats = computeStatsFromData(userId, interviews, answers);

  // Check for coding sessions & design sessions (extra badges)
  const codeQuery = query(collection(db, "codeSessions"), where("userId", "==", userId));
  const codeSnap = await getDocs(codeQuery);
  if (codeSnap.size > 0) stats.badges.push("code_warrior");

  const designQuery = query(collection(db, "systemDesigns"), where("userId", "==", userId));
  const designSnap = await getDocs(designQuery);
  if (designSnap.size > 0) stats.badges.push("architect");

  return stats;
}

/**
 * Update the user's stats in Firestore (for leaderboard)
 */
export async function updateUserStatsInFirestore(
  userId: string,
  displayName: string,
  imageUrl: string,
  providedStats?: UserStats
): Promise<UserStats> {
  const stats = providedStats || await computeUserStats(userId);
  stats.displayName = displayName;
  stats.imageUrl = imageUrl;

  await setDoc(doc(db, "userStats", userId), stats, { merge: true });
  return stats;
}
