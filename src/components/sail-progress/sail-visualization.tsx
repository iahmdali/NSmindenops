
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, GitFork, Milestone, MoreHorizontal, Package } from "lucide-react";
import type { ProgressNode } from "./progress-tree";
import { Badge } from "../ui/badge";

interface SailVisualizationProps {
  nodes: ProgressNode[];
}

const statusStyles: Record<string, string> = {
  "Completed": "bg-green-100 text-green-800 border-green-500",
  "Done": "bg-green-100 text-green-800 border-green-500",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-500",
  "default": "bg-gray-100 text-gray-800 border-gray-400",
};

function getStatusClass(status?: string) {
  if (!status) return statusStyles.default;
  const statusKey = Object.keys(statusStyles).find(key => status.toLowerCase().includes(key.toLowerCase()));
  return statusKey ? statusStyles[statusKey] : statusStyles.default;
}

export function SailVisualization({ nodes }: SailVisualizationProps) {
  // We can create a more complex structure if needed.
  // For now, we'll create a few "panels" and assign department data to them.
  const panelCount = 5; 
  const departments = ['Gantry', 'Films', 'Tapeheads', 'Graphics', 'Shipping'];
  
  const getPanelData = (index: number): ProgressNode | undefined => {
      const deptName = departments[index];
      return nodes.find(n => n.name === deptName);
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg min-h-[500px]">
        <div className="relative w-[300px] h-[450px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }}>
          {Array.from({ length: panelCount }).map((_, i) => {
            const panelData = getPanelData(i);
            const statusClass = getStatusClass(panelData?.status);
            
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-center border-b font-mono text-sm transition-all hover:brightness-110",
                      statusClass
                    )}
                    style={{ 
                        height: `${100 / panelCount}%`,
                        backgroundColor: `hsl(var(--primary-hsl), ${1 - (i * 0.12)})`
                    }}
                  >
                     <span className="mix-blend-multiply font-bold text-lg text-primary-foreground/80">{panelData?.name || departments[i]}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  {panelData ? (
                     <div>
                        <div className="font-bold text-lg mb-2 flex items-center justify-between">
                            <span>{panelData.name}</span>
                            <Badge className={cn(statusClass)}>{panelData.status}</Badge>
                        </div>
                        <ul className="space-y-2">
                           {panelData.children?.map(child => (
                            <li key={child.id} className="text-xs p-2 rounded-md bg-muted/50">
                                <p className="font-semibold">{child.name}</p>
                                <p className="text-muted-foreground">Status: {child.status}</p>
                                {child.details && Object.entries(child.details).map(([key, value]) => (
                                    <p key={key} className="text-muted-foreground">{key}: <span className="font-medium text-foreground">{value}</span></p>
                                ))}
                            </li>
                           ))}
                        </ul>
                     </div>
                  ) : (
                    <div className="text-center p-4">
                        <p className="font-semibold">{departments[i]}</p>
                        <p className="text-sm text-muted-foreground">No data available for this stage.</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
