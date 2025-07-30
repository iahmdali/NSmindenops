
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Milestone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export interface ProgressNode {
  id: string;
  name: string;
  status: string;
  details?: Record<string, string | number>;
  children?: ProgressNode[];
}

interface ProgressTreeProps {
  nodes: ProgressNode[];
}

const statusStyles = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Done: "bg-green-100 text-green-800 border-green-200",
  "Pass": "bg-green-100 text-green-800 border-green-200",
  "Fail": "bg-red-100 text-red-800 border-red-500",
  "Requires Reinspection": "bg-yellow-100 text-yellow-800 border-yellow-500",
  "Ready for Pickup": "bg-primary/20 text-primary border-primary/50",
  "Awaiting Pickup": "bg-primary/20 text-primary border-primary/50"
};

function getStatusClass(status?: string) {
  if (!status) return statusStyles.default;
  const statusKey = Object.keys(statusStyles).find(key => status.toLowerCase().includes(key.toLowerCase()));
  return statusKey ? statusStyles[statusKey as keyof typeof statusStyles] : statusStyles.default;
}

export function ProgressTree({ nodes }: ProgressTreeProps) {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
      <div className="space-y-8">
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

function TreeNode({ node }: { node: ProgressNode }) {
  const hasChildren = node.children && node.children.length > 0;
  
  const statusClass = getStatusClass(node.status);
  const isCompleted = node.status === 'Completed' || node.status === 'Done' || node.status === 'Pass' || node.status === 'Ready for Pickup';

  return (
    <div className="relative">
      {/* Circle on the vertical line */}
      <div className="absolute -left-[2.1rem] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Milestone className="h-5 w-5 text-primary" />
        )}
      </div>

      <Accordion type="single" collapsible defaultValue={hasChildren ? `item-${node.id}` : undefined}>
        <AccordionItem value={`item-${node.id}`} className="border-b-0">
          <Card className="overflow-hidden">
            <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>svg]:text-primary">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-primary">{node.name}</h3>
                  <Badge variant="outline" className={cn(statusClass)}>{node.status}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
                <div className="pl-6 border-l-2 border-dashed border-primary/50 ml-2 space-y-4">
                    {node.details && (
                        <div className="p-4 rounded-md bg-muted/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(node.details).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-xs text-muted-foreground">{key}</p>
                                    <p className="font-medium">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {hasChildren && <ProgressTree nodes={node.children!} />}
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
