
import type { Report, WorkItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Layers, Clock, Scissors, Tapes, Ruler, Wind, User, Calendar, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "../ui/separator";

interface EnrichedWorkItem extends WorkItem {
  report: Report;
}

interface SailStatusCardProps {
  item: EnrichedWorkItem;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    </div>
);

export function SailStatusCard({ item }: SailStatusCardProps) {
  const { report, ...workItem } = item;
  const isCompleted = workItem.endOfShiftStatus === 'Completed';

  return (
    <Card className={cn("flex flex-col transition-all", isCompleted ? "border-green-200 bg-green-50/50 hover:border-green-300" : "border-amber-200 bg-amber-50/50 hover:border-amber-300")}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-bold">{workItem.oeNumber} - {workItem.section}</CardTitle>
                <CardDescription>
                    <Badge variant={workItem.nestedPanels && workItem.nestedPanels.length > 0 ? "default" : "secondary"}>
                        {workItem.nestedPanels && workItem.nestedPanels.length > 0 ? 'Nested Panels' : 'Individual Panels'}
                    </Badge>
                </CardDescription>
            </div>
            <Badge variant={isCompleted ? "default" : "outline"} className={cn(isCompleted ? "bg-green-600" : "border-amber-500 text-amber-600")}>
                {isCompleted ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                {workItem.endOfShiftStatus}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        
        <div className="grid grid-cols-2 gap-4">
             <DetailItem icon={<User size={16}/>} label="Operator" value={report.operatorName} />
             <DetailItem icon={<Calendar size={16}/>} label="Date Worked" value={format(new Date(report.date), 'MMM d, yyyy')} />
             <DetailItem icon={<CircleDot size={16}/>} label="Material" value={workItem.materialType} />
             <DetailItem icon={<Clock size={16}/>} label="Shift" value={`${report.shift} (${report.shiftStartTime} - ${report.shiftEndTime})`} />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<Ruler size={16}/>} label="Meters Produced" value={`${workItem.total_meters}m`} />
            <DetailItem icon={<Tapes size={16}/>} label="Tapes Used" value={workItem.total_tapes} />
            {!isCompleted && workItem.layer && (
                <DetailItem icon={<Layers size={16}/>} label="Current Layer" value={workItem.layer} />
            )}
        </div>
        
        {workItem.had_spin_out && (
             <div className="p-2 bg-destructive/10 border-l-4 border-destructive rounded">
                <DetailItem icon={<Wind size={16} className="text-destructive"/>} label="Spin-Out Recorded" value={`${workItem.spin_out_duration_minutes || 'N/A'} min duration`} />
             </div>
        )}
        
        {workItem.issues && workItem.issues.length > 0 && (
             <div className="p-2 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
                <DetailItem icon={<AlertTriangle size={16} className="text-yellow-600"/>} label="Problems" value={workItem.issues.map(i => i.problem_reason).join(', ')} />
             </div>
        )}
        
      </CardContent>
    </Card>
  );
}
