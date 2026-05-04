import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { Code, Lightbulb, Sparkles, WebcamIcon, Boxes } from "lucide-react";
import WebCam from "react-webcam";

import { db } from "@/config/firebase.config";

import { LoaderPage } from "@/views/loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { InterviewPin } from "@/components/interview-pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Interview } from "@/types";

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);

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

      fetchInterview();
    }
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={interview?.position || ""}
          breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />

        <div className="flex items-center gap-2">
          <Link to={`/generate/interview/${interviewId}/code`}>
            <Button size={"sm"} variant={"outline"} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
              <Code className="w-4 h-4 mr-1" /> Coding Interview
            </Button>
          </Link>
          <Link to={`/generate/interview/${interviewId}/design`}>
            <Button size={"sm"} variant={"outline"} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300">
              <Boxes className="w-4 h-4 mr-1" /> System Design
            </Button>
          </Link>
          <Link to={`/generate/interview/${interviewId}/start`}>
            <Button size={"sm"}>
              Start <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {interview && <InterviewPin data={interview} onMockPage />}

      <Alert className="bg-amber-500/10 border-amber-500/30 p-4 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <div>
          <AlertTitle className="text-amber-500 font-semibold">
            Important Information
          </AlertTitle>
          <AlertDescription className="text-sm text-amber-500/90 mt-1">
            Please enable your webcam and microphone to start the AI-generated
            mock interview. The interview consists of five questions. You'll
            receive a personalized report based on your responses at the end.{" "}
            <br />
            <br />
            <span className="font-medium">Note:</span> Your video is{" "}
            <strong>never recorded</strong>. You can disable your webcam at any
            time.
          </AlertDescription>
        </div>
      </Alert>

      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border border-border/30 glass-card p-4 rounded-2xl">
          {isWebCamEnabled ? (
            <WebCam
              onUserMedia={() => setIsWebCamEnabled(true)}
              onUserMediaError={() => setIsWebCamEnabled(false)}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground/50" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Button onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}>
          {isWebCamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </Button>
      </div>
    </div>
  );
};
