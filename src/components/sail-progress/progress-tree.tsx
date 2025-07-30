
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Milestone, AlertTriangle, CircleDotDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import type { ProgressNode } from "@/lib/sail-progress-types";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  Prepped: "bg-green-100 text-green-800",
  "QC Passed": "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Requires Reinspection": "bg-yellow-100 text-yellow-800",
  "QC Fail": "bg-red-100 text-red-800",
  "Issues Logged": "bg-red-100 text-red-800",
  done: "bg-green-100 text-green-800",
  inProgress: "bg-yellow-100 text-yellow-800",
  todo: "bg-gray-100 text-gray-800",
  default: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<string, React.ElementType> = {
  Completed: CheckCircle,
  Prepped: CheckCircle,
  "QC Passed": CheckCircle,
  done: CheckCircle,
  "In Progress": CircleDotDashed,
  inProgress: CircleDotDashed,
  "Requires Reinspection": AlertTriangle,
  "QC Fail": AlertTriangle,
  "Issues Logged": AlertTriangle,
  default: Milestone,
};


function getStatusInfo(status: string): { className: string, Icon: React.ElementType } {
  const statusKey = Object.keys(statusStyles).find(key => status.toLowerCase().includes(key.toLowerCase())) || 'default';
  const iconKey = Object.keys(statusIcons).find(key => status.toLowerCase().includes(key.toLowerCase())) || 'default';
  return {
    className: statusStyles[statusKey],
    Icon: statusIcons[iconKey],
  };
}

export function ProgressTree({ nodes }: { nodes: ProgressNode[] }) {
  if (!nodes || nodes.length === 0) {
    return <p className="text-muted-foreground">No progress data available for this sail.</p>;
  }

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
  const { className: statusClass, Icon } = getStatusInfo(node.status);

  return (
    <div className="relative">
      {/* Circle on the vertical line */}
      <div className={cn(
          "absolute -left-[2.1rem] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2",
          node.status.includes('Fail') || node.status.includes('Issues') ? 'border-red-500' : 
          node.status.includes('Progress') || node.status.includes('Reinspection') ? 'border-yellow-500' :
          'border-primary'
        )}>
          <Icon className={cn(
              "h-5 w-5",
              node.status.includes('Fail') || node.status.includes('Issues') ? 'text-red-500' : 
              node.status.includes('Progress') || node.status.includes('Reinspection') ? 'text-yellow-500' :
              node.status.includes('Completed') || node.status.includes('Passed') ? 'text-green-600' :
              'text-primary'
          )} />
      </div>

      <Accordion type="single" collapsible defaultValue={hasChildren ? `item-${node.id}` : undefined} className="border-b-0">
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
