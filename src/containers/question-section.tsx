import { useState } from "react";

import { cn } from "@/lib/utils";

import { TooltipButton } from "@/components/tooltip-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, VolumeX } from "lucide-react";
import { RecordAnswer } from "./record-answer";
import { InterviewQuestion } from "@/types";

interface QuestionSectionProps {
  questions: InterviewQuestion[];
}

export const QuestionSection = ({ questions }: QuestionSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [currentSpeech, setCurrentSpeech] =
    useState<SpeechSynthesisUtterance | null>(null);

  const handlePlayQuestion = (qst: string) => {
    if (isPlaying && currentSpeech) {
      // stop the speech if already playing
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      // start speech if not currently playing
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(qst);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);

        // handle the speech end
        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };
      }
    }
  };

  return (
    <div className="w-full min-h-96 border rounded-md p-4">
      <Tabs
        defaultValue={questions[0]?.question}
        className="w-full space-y-12"
        orientation="vertical"
      >
        <TabsList className="bg-transparent w-full flex flex-wrap items-center justify-start gap-4">
          {questions?.map((tab, i) => (
            <TabsTrigger
              className={cn(
                "data-[state=active]:bg-emerald-200 data-[state=active]:shadow-md text-xs px-2"
              )}
              key={tab.question}
              value={tab.question}
            >
              {`Question #${i + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {questions?.map((tab, i) => (
          <TabsContent key={i} value={tab.question}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {tab.type && (
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {tab.type.replace("-", " ")}
                  </span>
                )}
                {tab.difficulty && (
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
                    {tab.difficulty}
                  </span>
                )}
                {tab.category && (
                  <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {tab.category}
                  </span>
                )}
              </div>

              <p className="text-base text-left leading-7 text-foreground">
                {tab.question}
              </p>

              {tab.type === "mcq" && tab.options && tab.options.length > 0 && (
                <div className="grid gap-2">
                  {tab.options.map((option, optionIndex) => (
                    <div
                      key={option}
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground/85"
                    >
                      <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-end">
              <TooltipButton
                content={isPlaying ? "Stop" : "Start"}
                icon={
                  isPlaying ? (
                    <VolumeX className="min-w-5 min-h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="min-w-5 min-h-5 text-muted-foreground" />
                  )
                }
                onClick={() => handlePlayQuestion(tab.question)}
              />
            </div>

            <RecordAnswer
              question={tab}
              isWebCam={isWebCam}
              setIsWebCam={setIsWebCam}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
