import { useCallback, useEffect, useRef, useState } from "react";
import {
  Boxes,
  Cloud,
  Database,
  Globe2,
  HardDrive,
  Layers3,
  Link2,
  Monitor,
  Network,
  Route,
  Server,
  Shield,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";

import { DesignEdge, DesignNode } from "@/types";

interface WhiteboardCanvasProps {
  nodes: DesignNode[];
  edges: DesignEdge[];
  onNodesChange: (nodes: DesignNode[]) => void;
  onEdgesChange: (edges: DesignEdge[]) => void;
}

const NODE_COLORS: Record<string, string> = {
  Client: "#3b82f6",
  "Load Balancer": "#8b5cf6",
  "API Gateway": "#6366f1",
  "Web Server": "#10b981",
  "App Server": "#14b8a6",
  "Cache (Redis)": "#ef4444",
  "Database (SQL)": "#f59e0b",
  "Database (NoSQL)": "#f97316",
  "Message Queue": "#ec4899",
  CDN: "#06b6d4",
  "Storage (S3)": "#84cc16",
  Microservice: "#a855f7",
  Router: "#64748b",
};

const NODE_ICONS: Record<string, React.ElementType> = {
  Client: Monitor,
  "Load Balancer": Network,
  "API Gateway": Shield,
  "Web Server": Server,
  "App Server": Layers3,
  "Cache (Redis)": Zap,
  "Database (SQL)": Database,
  "Database (NoSQL)": HardDrive,
  "Message Queue": Workflow,
  CDN: Globe2,
  "Storage (S3)": Cloud,
  Microservice: Boxes,
  Router: Route,
};

export const WhiteboardCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: WhiteboardCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const deleteNode = useCallback(
    (nodeId: string) => {
      onNodesChange(nodes.filter((node) => node.id !== nodeId));
      onEdgesChange(edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId));
      setSelectedNode(null);
      if (connectingFrom === nodeId) setConnectingFrom(null);
    },
    [connectingFrom, edges, nodes, onEdgesChange, onNodesChange]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConnectingFrom(null);
      if ((event.key === "Delete" || event.key === "Backspace") && selectedNode) {
        deleteNode(selectedNode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteNode, selectedNode]);

  const handleNodeMouseDown = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();
      const node = nodes.find((item) => item.id === nodeId);
      if (!node || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: event.clientX - rect.left - node.x,
        y: event.clientY - rect.top - node.y,
      });
      setSelectedNode(nodeId);
    },
    [nodes]
  );

  useEffect(() => {
    if (!draggingNodeId) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(rect.width - 160, event.clientX - rect.left - dragOffset.x));
      const newY = Math.max(0, Math.min(rect.height - 70, event.clientY - rect.top - dragOffset.y));

      onNodesChange(
        nodes.map((node) =>
          node.id === draggingNodeId ? { ...node, x: newX, y: newY } : node
        )
      );
    };

    const handleMouseUp = () => setDraggingNodeId(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragOffset, draggingNodeId, nodes, onNodesChange]);

  useEffect(() => {
    if (!connectingFrom || !canvasRef.current) return;

    const handleMove = (event: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [connectingFrom]);

  const startConnect = (nodeId: string) => {
    if (connectingFrom === null) {
      setConnectingFrom(nodeId);
      return;
    }

    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
      return;
    }

    const exists = edges.some(
      (edge) =>
        (edge.from === connectingFrom && edge.to === nodeId) ||
        (edge.from === nodeId && edge.to === connectingFrom)
    );

    if (!exists) {
      onEdgesChange([
        ...edges,
        { id: `edge-${Date.now()}`, from: connectingFrom, to: nodeId },
      ]);
    }
    setConnectingFrom(null);
  };

  const deleteEdge = (edgeId: string) => {
    onEdgesChange(edges.filter((edge) => edge.id !== edgeId));
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("componentType");
      if (!type || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - 80;
      const y = event.clientY - rect.top - 35;

      onNodesChange([
        ...nodes,
        {
          id: `node-${Date.now()}`,
          type,
          label: type,
          x: Math.max(0, x),
          y: Math.max(0, y),
        },
      ]);
    },
    [nodes, onNodesChange]
  );

  const getNodeCenter = (node: DesignNode) => ({
    x: node.x + 80,
    y: node.y + 35,
  });

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-hidden rounded-md border border-border bg-background"
      style={{
        backgroundImage:
          "linear-gradient(rgba(196,191,176,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(196,191,176,0.24) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onClick={() => {
        setSelectedNode(null);
        setConnectingFrom(null);
      }}
    >
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        {edges.map((edge) => {
          const fromNode = nodes.find((node) => node.id === edge.from);
          const toNode = nodes.find((node) => node.id === edge.to);
          if (!fromNode || !toNode) return null;
          const from = getNodeCenter(fromNode);
          const to = getNodeCenter(toNode);
          const midX = (from.x + to.x) / 2;

          return (
            <g key={edge.id}>
              <path
                d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                stroke="rgba(10,10,10,0.42)"
                strokeWidth="2"
                fill="none"
                className="cursor-pointer transition-colors hover:stroke-red-500"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteEdge(edge.id);
                }}
              />
              <circle cx={to.x} cy={to.y} r="4" fill="rgba(10,10,10,0.46)" />
            </g>
          );
        })}

        {connectingFrom && (() => {
          const fromNode = nodes.find((node) => node.id === connectingFrom);
          if (!fromNode) return null;
          const from = getNodeCenter(fromNode);
          return (
            <line
              x1={from.x}
              y1={from.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#c8502a"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          );
        })()}
      </svg>

      {nodes.map((node) => {
        const Icon = NODE_ICONS[node.type] || Boxes;
        return (
          <div
            key={node.id}
            className={`whiteboard-node ${selectedNode === node.id ? "selected" : ""}`}
            style={{
              left: node.x,
              top: node.y,
              zIndex: draggingNodeId === node.id ? 100 : 2,
            }}
            onMouseDown={(event) => handleNodeMouseDown(event, node.id)}
          >
            <div
              className="flex min-w-[160px] items-center gap-2 rounded-md border bg-background px-4 py-3 shadow-sm"
              style={{
                borderColor: `${NODE_COLORS[node.type] || "#666"}80`,
              }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: NODE_COLORS[node.type] || "#666" }} />
              <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                {node.label}
              </span>
            </div>

            <button
              className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors ${
                connectingFrom === node.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                startConnect(node.id);
              }}
              title="Connect this component"
              type="button"
            >
              <Link2 className="h-3 w-3" />
            </button>

            {selectedNode === node.id && (
              <button
                type="button"
                className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteNode(node.id);
                }}
                title="Delete component"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="max-w-sm text-center">
            <p className="text-lg font-semibold text-foreground">Start your architecture diagram</p>
            <p className="mt-2 text-sm leading-6">
              Drag or click components from the palette. Use the link button on a component to connect it to another component.
            </p>
          </div>
        </div>
      )}

      {connectingFrom && (
        <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2">
          <span className="text-xs font-medium text-primary">
            Click another component to connect. Press Esc to cancel.
          </span>
        </div>
      )}

      <div className="absolute right-3 top-3 z-10 rounded-md border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground">
        {nodes.length} components / {edges.length} connections
      </div>
    </div>
  );
};
