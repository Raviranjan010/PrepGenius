import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { ArrowLeft, Loader, Plus, Save, Send, Trash2 } from "lucide-react";

import { db } from "@/config/firebase.config";
import { chatSession } from "@/scripts/ai-studio";
import { DesignEdge, DesignNode, Interview } from "@/types";
import { LoaderPage } from "@/views/loader-page";
import { Button } from "@/components/ui/button";
import { WhiteboardCanvas } from "@/containers/whiteboard-canvas";
import { DesignComponentPalette } from "@/containers/design-component-palette";

export const SystemDesignPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<DesignNode[]>([]);
  const [edges, setEdges] = useState<DesignEdge[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!interviewId) {
      navigate("/generate", { replace: true });
      return;
    }

    const fetchInterviewAndDesign = async () => {
      try {
        const snap = await getDoc(doc(db, "interviews", interviewId));
        if (!snap.exists()) {
          navigate("/generate", { replace: true });
          return;
        }

        setInterview(snap.data() as Interview);

        if (userId) {
          const designQuery = query(
            collection(db, "systemDesigns"),
            where("userId", "==", userId),
            where("interviewId", "==", interviewId),
            limit(1)
          );
          const designSnap = await getDocs(designQuery);
          if (!designSnap.empty) {
            const designDoc = designSnap.docs[0];
            const savedDesign = designDoc.data();
            setDesignId(designDoc.id);
            setNodes((savedDesign.nodes ?? []) as DesignNode[]);
            setEdges((savedDesign.edges ?? []) as DesignEdge[]);
            setAiFeedback(savedDesign.aiFeedback ?? "");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load system design workspace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewAndDesign();
  }, [interviewId, navigate, userId]);

  const diagramSummary = useMemo(() => {
    const componentList = nodes.map((node) => `${node.label} (${node.type})`).join(", ");
    const connectionList = edges
      .map((edge) => {
        const from = nodes.find((node) => node.id === edge.from);
        const to = nodes.find((node) => node.id === edge.to);
        return from && to ? `${from.label} -> ${to.label}` : null;
      })
      .filter(Boolean)
      .join(", ");

    return {
      componentList: componentList || "No components",
      connectionList: connectionList || "No connections",
    };
  }, [edges, nodes]);

  const addComponent = (type: string) => {
    const offset = nodes.length * 28;
    setNodes([
      ...nodes,
      {
        id: `node-${Date.now()}`,
        type,
        label: type,
        x: 80 + (offset % 280),
        y: 80 + (offset % 220),
      },
    ]);
  };

  const analyzeDesign = async () => {
    if (nodes.length < 2) {
      toast.error("Add at least 2 components before requesting a review");
      return;
    }

    setIsAnalyzing(true);
    try {
      const diagramJSON = JSON.stringify(
        {
          components: nodes.map((node) => ({ type: node.type, label: node.label })),
          connections: edges.map((edge) => {
            const from = nodes.find((node) => node.id === edge.from);
            const to = nodes.find((node) => node.id === edge.to);
            return { from: from?.label, to: to?.label };
          }),
        },
        null,
        2
      );

      const prompt = `You are a senior system design interviewer reviewing a candidate's architecture diagram for a ${interview?.position} role.

Candidate context:
- Interview description: ${interview?.description || "General scalable application"}
- Experience: ${interview?.experience ?? 0} years
- Tech stack: ${interview?.techStack || "Not specified"}

Candidate system design JSON:
${diagramJSON}

Provide a detailed but practical review with these sections:
1. Architecture overview
2. What is working well
3. Missing components or unclear flows
4. Scalability and reliability risks
5. Concrete improvements
6. Score out of 10

Reference the actual components and connections. Do not invent components that are not in the diagram unless you are recommending them.`;

      const result = await chatSession.sendMessage(prompt);
      setAiFeedback(result.response.text());
      toast.success("Design review generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze design");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveDesign = async () => {
    if (!userId || !interviewId) {
      toast.error("Unable to save design");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        interviewId,
        userId,
        nodes,
        edges,
        aiFeedback,
        updatedAt: serverTimestamp(),
      };

      if (designId) {
        await updateDoc(doc(db, "systemDesigns", designId), payload);
      } else {
        const ref = await addDoc(collection(db, "systemDesigns"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setDesignId(ref.id);
        await updateDoc(doc(db, "systemDesigns", ref.id), { id: ref.id });
      }

      toast.success("Design saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setAiFeedback("");
  };

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col bg-secondary/35">
      <div className="flex flex-col gap-3 border-b border-border bg-background px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">System design practice</p>
            <h1 className="truncate text-lg font-semibold">{interview?.position}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addComponent("Client")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Quick client
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeDesign}
            disabled={isAnalyzing || nodes.length < 2}
          >
            {isAnalyzing ? <Loader className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
            {isAnalyzing ? "Reviewing..." : "Generate review"}
          </Button>
          <Button size="sm" onClick={saveDesign} disabled={isSaving}>
            {isSaving ? <Loader className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
            {designId ? "Update design" : "Save design"}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[260px_minmax(0,1fr)_380px]">
        <aside className="min-h-0 overflow-y-auto border-b border-border bg-card p-4 xl:border-b-0 xl:border-r">
          <DesignComponentPalette onAddComponent={addComponent} />
        </aside>

        <section className="min-h-[520px] p-3">
          <WhiteboardCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />
        </section>

        <aside className="min-h-0 overflow-y-auto border-t border-border bg-background xl:border-l xl:border-t-0">
          <div className="border-b border-border p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Design details</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <p className="font-semibold">Components</p>
                <p className="mt-1 leading-6 text-muted-foreground">{diagramSummary.componentList}</p>
              </div>
              <div>
                <p className="font-semibold">Connections</p>
                <p className="mt-1 leading-6 text-muted-foreground">{diagramSummary.connectionList}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">AI review</p>
            {aiFeedback ? (
              <div className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-card p-4 text-sm leading-7 text-foreground">
                {aiFeedback}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                Build a diagram with at least two components, connect the important flows, then generate a review. Save after reviewing to keep the diagram on this interview.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
