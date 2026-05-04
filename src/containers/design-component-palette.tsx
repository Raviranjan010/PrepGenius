import {
  Boxes,
  Cloud,
  Database,
  Globe2,
  HardDrive,
  Layers3,
  Monitor,
  Network,
  Route,
  Server,
  Shield,
  Workflow,
  Zap,
} from "lucide-react";

interface DesignComponentPaletteProps {
  className?: string;
  onAddComponent?: (type: string) => void;
}

const COMPONENT_CATEGORIES = [
  {
    label: "Clients",
    items: [{ type: "Client", icon: Monitor }],
  },
  {
    label: "Networking",
    items: [
      { type: "Load Balancer", icon: Network },
      { type: "API Gateway", icon: Shield },
      { type: "CDN", icon: Globe2 },
    ],
  },
  {
    label: "Compute",
    items: [
      { type: "Web Server", icon: Server },
      { type: "App Server", icon: Layers3 },
      { type: "Microservice", icon: Boxes },
    ],
  },
  {
    label: "Storage",
    items: [
      { type: "Database (SQL)", icon: Database },
      { type: "Database (NoSQL)", icon: HardDrive },
      { type: "Storage (S3)", icon: Cloud },
    ],
  },
  {
    label: "Messaging",
    items: [
      { type: "Cache (Redis)", icon: Zap },
      { type: "Message Queue", icon: Workflow },
      { type: "Router", icon: Route },
    ],
  },
];

export const DesignComponentPalette = ({ className, onAddComponent }: DesignComponentPaletteProps) => {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("componentType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ""}`}>
      <div className="px-1">
        <h3 className="text-sm font-semibold text-foreground mb-1">Components</h3>
        <p className="text-xs text-muted-foreground">Drag onto the canvas or click to add</p>
      </div>

      {COMPONENT_CATEGORIES.map((category) => (
        <div key={category.label} className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
            {category.label}
          </h4>
          <div className="space-y-1">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  onClick={() => onAddComponent?.(item.type)}
                  className="flex w-full cursor-grab items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-secondary active:cursor-grabbing"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {item.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
