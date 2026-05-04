import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { computeStatsFromData, updateUserStatsInFirestore } from "@/lib/streak-tracker";

export const useStats = (userId: string | null | undefined, userProfile?: { fullName?: string | null; firstName?: string | null; imageUrl?: string }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const interviewsQuery = query(collection(db, "interviews"), where("userId", "==", userId));
    const answersQuery = query(collection(db, "userAnswers"), where("userId", "==", userId));

    const unsubInterviews = onSnapshot(interviewsQuery, (snap) => {
      const data = snap.docs.map((doc) => doc.data() as Interview);
      setInterviews(data);
    });

    const unsubAnswers = onSnapshot(answersQuery, (snap) => {
      const data = snap.docs.map((doc) => doc.data() as UserAnswer);
      setAnswers(data);
    });

    setLoading(false);

    return () => {
      unsubInterviews();
      unsubAnswers();
    };
  }, [userId]);

  const stats = useMemo(() => {
    if (!userId) return null;
    return computeStatsFromData(userId, interviews, answers);
  }, [userId, interviews, answers]);

  // Sync with Firestore for leaderboard
  useEffect(() => {
    if (stats && userId && userProfile) {
      const timeout = setTimeout(() => {
        updateUserStatsInFirestore(
          userId,
          userProfile.fullName || userProfile.firstName || "Anonymous",
          userProfile.imageUrl || "",
          stats
        ).catch(console.error);
      }, 5000); // Debounce sync to avoid excessive writes
      return () => clearTimeout(timeout);
    }
  }, [stats, userId, userProfile]);

  return {
    stats,
    interviews,
    answers,
    loading
  };
};
