import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@clerk/clerk-react";

import { LoaderPage } from "@/views/loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/interview-pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { cn } from "@/lib/utils";
import { CircleCheck, MessageSquareText, Play, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        setIsLoading(true);
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({ ...interviewDoc.data() } as Interview);
          } else {
            navigate("/generate", { replace: true });
          }
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            return doc.data() as UserAnswer;
          });

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const ratedFeedbacks = feedbacks.filter((feedback) => feedback.rating > 0);
    if (ratedFeedbacks.length === 0) return "0.0";

    const totalRatings = ratedFeedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / ratedFeedbacks.length).toFixed(1);
  }, [feedbacks]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={"Feedback"}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings
        title={feedbacks.length > 0 ? "Interview Feedback" : "No feedback yet"}
        description={
          feedbacks.length > 0
            ? "Review your saved answers, ratings, expected answers, and improvement notes."
            : "Open the interview, answer a question, then click Generate Feedback when you are ready."
        }
      />

      <p className="text-base text-muted-foreground">
        Your overall interview ratings :{" "}
        <span className="text-emerald-500 font-semibold text-xl">
          {overAllRating} / 10
        </span>
      </p>

      {interview && <InterviewPin data={interview} onMockPage />}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-4 rounded-md border border-border bg-card p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquareText className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>No reviewed answers saved</CardTitle>
            <CardDescription className="mt-2 max-w-md">
              Feedback is generated from your actual answer. Go back to the interview, record or type your response, choose Generate Feedback, then save it.
            </CardDescription>
          </div>
          <Button onClick={() => navigate(`/generate/interview/${interviewId}`)}>
            <Play className="mr-2 h-4 w-4" />
            Practice and generate feedback
          </Button>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed.id
                    ? "bg-muted/50 text-emerald-400"
                    : "hover:bg-muted/30"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-black/20 rounded-b-lg space-y-5 shadow-inner border-t border-border/50">
                <div className="text-lg font-semibold text-foreground">
                  <Star className="inline mr-2 text-yellow-400" />
                  Rating : {feed.rating}
                </div>

                <Card className="border border-emerald-500/20 space-y-3 p-4 bg-emerald-500/5 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-emerald-400">
                    <CircleCheck className="mr-2 text-emerald-500" />
                    Expected Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-muted-foreground">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border border-blue-500/20 space-y-3 p-4 bg-blue-500/5 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-blue-400">
                    <CircleCheck className="mr-2 text-blue-500" />
                    Your Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-muted-foreground">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border border-red-500/20 space-y-3 p-4 bg-red-500/5 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-red-400">
                    <CircleCheck className="mr-2 text-red-500" />
                    Feedback
                  </CardTitle>

                  <CardDescription className="font-medium text-muted-foreground">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
