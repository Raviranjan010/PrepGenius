import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { Button } from "@/components/ui/button";
import { Loader, Trash2, Cpu, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getChatSession, GeminiModel } from "@/scripts/ai-studio";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { toast } from "sonner";
import { ResumeUpload } from "@/components/resume-upload";

interface FormMockInterview {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
  resume: z.string().optional(),
  targetJD: z.string().optional(),
  aiModel: z.enum(["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"]).default("gemini-1.5-flash"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterview) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      position: "",
      description: "",
      experience: 0,
      techStack: "",
      resume: "",
      targetJD: "",
      aiModel: "gemini-1.5-flash",
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData
    ? initialData.position
    : "Create a new mock interview";

  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Extract a JSON array by capturing text between square brackets
    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }

    try {
      const parsed = JSON.parse(cleanText);
      if (!Array.isArray(parsed)) {
        throw new Error("Response was not an array");
      }

      return parsed
        .filter((item) => item?.question && item?.answer)
        .map((item) => ({
          question: String(item.question).trim(),
          answer: String(item.answer).trim(),
          type: item.type ?? "technical",
          difficulty: item.difficulty ?? "medium",
          category: item.category ?? "General",
          options: Array.isArray(item.options) ? item.options.map(String) : undefined,
          correctOption: item.correctOption ? String(item.correctOption) : undefined,
          explanation: item.explanation ? String(item.explanation) : undefined,
        }));
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const buildInterviewPrompt = (
    data: FormData,
    hasResume: boolean,
    hasTargetJD: boolean
  ) => {
    const outputContract = `
Generate exactly 10 interview items for a production-quality mock interview.
Use this mix:
- 3 deep technical questions
- 2 scenario or debugging questions
- 2 system-design or architecture trade-off questions
- 1 behavioral question using the STAR format
- 2 MCQs with 4 realistic options each

Each item must use this JSON shape:
{
  "type": "technical" | "behavioral" | "system-design" | "debugging" | "mcq",
  "difficulty": "easy" | "medium" | "hard",
  "category": "<skill area>",
  "question": "<clear interviewer question>",
  "answer": "<strong sample answer with evaluation points>",
  "options": ["<A>", "<B>", "<C>", "<D>"],
  "correctOption": "<exact correct option text for MCQs only>",
  "explanation": "<why the correct MCQ option is best>"
}

Rules:
- Make every question specific, practical, and appropriate for ${data.experience} years of experience.
- Avoid generic textbook prompts unless they are tied to the role or project context.
- Do not include markdown, asterisks, labels, code fences, or commentary outside JSON.
- Return only a valid JSON array.`;

    const roleContext = `
Job Position: ${data.position}
Job Description: ${data.description}
Years of Experience Required: ${data.experience}
Tech Stack: ${data.techStack}`;

    if (hasResume && hasTargetJD) {
      return `
You are an expert technical interviewer. Build a tailored interview from the candidate's resume and target job description.

Cross-reference resume projects, technologies, achievements, and job-description requirements. Probe claims, expose gaps, and ask for concrete trade-offs the candidate should be able to explain.

${outputContract}

${roleContext}

CANDIDATE RESUME:
${data.resume}

TARGET JOB DESCRIPTION:
${data.targetJD}`;
    }

    if (hasResume) {
      return `
You are an expert technical interviewer. Build a personalized interview from the candidate's resume.

Reference specific resume projects, technologies, role transitions, metrics, and achievements. Probe claimed expertise with realistic follow-ups.

${outputContract}

${roleContext}

CANDIDATE RESUME:
${data.resume}`;
    }

    return `
You are an expert technical interviewer. Build a realistic mock interview from the role details below.

${outputContract}

${roleContext}
${hasTargetJD ? `\nTarget Job Description:\n${data.targetJD}` : ""}

Assess development best practices, debugging, real-world problem solving, system trade-offs, and communication quality.`;
  };

  const generateAiResult = async (data: FormData) => {
    const hasResume = Boolean(data.resume && data.resume.trim().length > 50);
    const hasTargetJD = Boolean(data.targetJD && data.targetJD.trim().length > 20);

    const prompt = buildInterviewPrompt(data, hasResume, hasTargetJD);

    const session = getChatSession(data.aiModel as GeminiModel);
    const aiResult = await session.sendMessage(prompt);
    const cleanedResponse = cleanJsonResponse(aiResult.response.text());

    return cleanedResponse;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (initialData) {
        // update api
        if (isValid) {
          // create a new mock interview
          const aiResult = await generateAiResult(data);

          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...data,
            updatedAt: serverTimestamp(),
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        // create api

        if (isValid) {
          // create a new mock interview
          const aiResult = await generateAiResult(data);

          const interviewRef = await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          });

          const id = interviewRef.id;

          await updateDoc(doc(db, "interviews", id), {
            id,
            updatedAt: serverTimestamp(),
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error..", {
        description: `Something went wrong. Please try again later`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
        resume: initialData.resume || "",
        targetJD: initialData.targetJD || "",
        aiModel: (initialData as any).aiModel || "gemini-1.5-flash",
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-4">
      {/* Bread Crumb */}
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />

        {initialData && (
          <Button size={"icon"} variant={"ghost"}>
            <Trash2 className="text-red-500 min-w-4 min-h-4" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="my-6"></div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass-card w-full p-8 rounded-2xl flex-col flex items-start justify-start gap-6"
        >
          {/* Model Selection */}
          <FormField
            control={form.control}
            name="aiModel"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <FormLabel>Cognitive Model (AI Intelligence)</FormLabel>
                </div>
                <FormControl>
                  <div className="relative group">
                    <select
                      {...field}
                      className="h-12 w-full rounded-xl bg-white/45 border border-white/70 px-4 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none transition-all hover:bg-white"
                    >
                      <option value="gemini-1.5-flash" className="bg-background">Gemini 1.5 Flash (Balanced & Fast)</option>
                      <option value="gemini-1.5-pro" className="bg-background">Gemini 1.5 Pro (Deep & Complex)</option>
                      <option value="gemini-2.0-flash-exp" className="bg-background">Gemini 2.0 Flash Exp (State-of-the-art)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Role / Job Position</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12 rounded-xl"
                    disabled={isLoading}
                    placeholder="eg:- Full Stack Developer"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Description / Key Projects</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-24 rounded-xl"
                    disabled={isLoading}
                    placeholder="Describe the role or paste the core requirements..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Years of Experience</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-12 rounded-xl"
                      disabled={isLoading}
                      placeholder="eg:- 5"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techStack"
              render={({ field }) => (
                <FormItem className="w-full space-y-4">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel>Tech Stacks</FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      className="h-12 rounded-xl"
                      disabled={isLoading}
                      placeholder="eg:- React, Node.js, SQL"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Target Job Description */}
          <FormField
            control={form.control}
            name="targetJD"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Target Job Description (Optional)</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-32 rounded-xl"
                    disabled={isLoading}
                    placeholder="Paste the full job description. The AI will cross-reference this with your resume..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Resume Upload (PDF or paste) */}
          <FormField
            control={form.control}
            name="resume"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Resume / CV (Optional)</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <ResumeUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full flex items-center justify-end gap-6 pt-4">
            <Button
              type="reset"
              size={"lg"}
              variant={"ghost"}
              className="rounded-xl"
              disabled={isSubmitting || isLoading}
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size={"lg"}
              className="rounded-xl px-12 transition-all hover:scale-105"
              disabled={isSubmitting || !isValid || isLoading}
            >
              {isLoading ? (
                <Loader className="text-gray-50 animate-spin" />
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
