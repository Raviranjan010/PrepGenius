import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@clerk/clerk-react";
import { Award, Clock, TrendingUp, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

import { LoaderPage } from "@/views/loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { ReplayTimeline } from "@/containers/replay-timeline";
import { ReplayAnnotationCard } from "@/components/replay-annotation-card";
import { Button } from "@/components/ui/button";

export const ReplayPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!interviewId) { navigate("/generate", { replace: true }); return; }

    const fetchData = async () => {
      try {
        // Fetch interview
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview(interviewDoc.data() as Interview);
        } else {
          navigate("/generate", { replace: true });
          return;
        }

        // Fetch feedbacks
        const q = query(
          collection(db, "userAnswers"),
          where("userId", "==", userId),
          where("mockIdRef", "==", interviewId)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => d.data() as UserAnswer);
        setFeedbacks(data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load replay data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [interviewId, userId, navigate]);

  const overallRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    return feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  }, [feedbacks]);

  const avgWPM = useMemo(() => {
    const withWPM = feedbacks.filter((f) => f.avgWPM && f.avgWPM > 0);
    if (withWPM.length === 0) return 0;
    return Math.round(withWPM.reduce((sum, f) => sum + (f.avgWPM || 0), 0) / withWPM.length);
  }, [feedbacks]);

  const avgConfidence = useMemo(() => {
    const withConf = feedbacks.filter((f) => f.confidenceScore && f.confidenceScore > 0);
    if (withConf.length === 0) return 0;
    return Math.round(withConf.reduce((sum, f) => sum + (f.confidenceScore || 0), 0) / withConf.length);
  }, [feedbacks]);

  const totalFillers = useMemo(() => {
    return feedbacks.reduce((sum, f) => sum + (f.fillerCount || 0), 0);
  }, [feedbacks]);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-foreground">No replay data</h2>
        <p className="text-muted-foreground text-sm">Complete an interview first to see your replay.</p>
        <Button onClick={() => navigate("/generate")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 py-5 animate-fade-in">
      <CustomBreadCrumb
        breadCrumbPage="Replay"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          { label: interview?.position || "", link: `/generate/interview/${interview?.id}` },
        ]}
      />

      {/* Session Summary */}
      <div className="glass-card rounded-2xl p-6 border border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{interview?.position}</h2>
            <p className="text-sm text-muted-foreground mt-1">Interview Replay & Analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-2xl font-bold text-emerald-400">{overallRating.toFixed(1)}</span>
              <span className="text-sm text-emerald-400/70">/10</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
              <p className="text-sm font-bold text-foreground">{overallRating.toFixed(1)}/10</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Pace</p>
              <p className="text-sm font-bold text-foreground">{avgWPM} WPM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-sm font-bold text-foreground">{avgConfidence}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Total Fillers</p>
              <p className="text-sm font-bold text-foreground">{totalFillers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card rounded-2xl p-6 border border-border/30">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Interview Timeline
        </h3>
        <ReplayTimeline
          feedbacks={feedbacks}
          activeIndex={activeIndex}
          onSelectIndex={setActiveIndex}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Question {activeIndex + 1} of {feedbacks.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={activeIndex === feedbacks.length - 1}
          onClick={() => setActiveIndex((i) => Math.min(feedbacks.length - 1, i + 1))}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Active Question Detail */}
      {feedbacks[activeIndex] && (
        <ReplayAnnotationCard
          feedback={feedbacks[activeIndex]}
          index={activeIndex}
        />
      )}
    </div>
  );
};

