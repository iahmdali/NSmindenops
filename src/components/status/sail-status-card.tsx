
import type { Report, WorkItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Layers, Clock, Shapes, Ruler, Wind, User, Calendar, CircleDot, Film, GanttChartSquare, XCircle, Hourglass, Factory } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "../ui/separator";

interface FilmsInfo {
    status: 'Prepped' | 'In Progress' | 'No Entry';
    workDate?: string;
    gantry?: string;
    notes?: string;
}

interface GantryInfo {
    moldNumber: string;
    stage: string;
    issues?: string;
    downtimeCaused?: boolean;
    date: string;
}

interface EnrichedWorkItem extends WorkItem {
  report: Report;
  filmsInfo: FilmsInfo;
  gantryHistory: GantryInfo[];
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

function FilmsStatusSection({ filmsInfo }: { filmsInfo: FilmsInfo }) {
  const getStatusBadge = () => {
    switch (filmsInfo.status) {
      case 'Prepped':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="mr-1 h-3 w-3" /> Prepped</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Hourglass className="mr-1 h-3 w-3" /> In Progress</Badge>;
      case 'No Entry':
      default:
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> No Entry</Badge>;
    }
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-primary/90 flex items-center gap-2"><Film size={16}/>Films Department</h4>
            {getStatusBadge()}
        </div>
        {filmsInfo.status !== 'No Entry' && (
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pl-2">
                <DetailItem icon={<Calendar size={14}/>} label="Work Date" value={filmsInfo.workDate ? format(new Date(filmsInfo.workDate), 'MMM d, yyyy') : 'N/A'} />
                <DetailItem icon={<GanttChartSquare size={14}/>} label="Gantry Assigned" value={filmsInfo.gantry ? `Gantry ${filmsInfo.gantry}`: 'N/A'} />
                 {filmsInfo.notes && (
                    <div className="col-span-2">
                         <DetailItem icon={<CircleDot size={14}/>} label="Notes" value={filmsInfo.notes} />
                    </div>
                 )}
            </div>
        )}
    </div>
  )
}

function GantryStatusSection({ gantryHistory }: { gantryHistory: GantryInfo[] }) {
    if (gantryHistory.length === 0) {
        return (
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-primary/90 flex items-center gap-2"><Factory size={16}/>Gantry Department</h4>
                    <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> No Entry</Badge>
                </div>
            </div>
        )
    }

    const latestEntry = gantryHistory[0]; // Assumes history is pre-sorted

    const getStageBadge = (stage: string) => {
        const completedStages = ["cured", "lamination", "lamination inspection"];
        const isCompleted = completedStages.some(s => stage.toLowerCase().includes(s));
        return (
             <Badge variant={isCompleted ? 'default' : 'outline'} className={isCompleted ? 'bg-green-600' : 'border-amber-500 text-amber-600'}>
                {isCompleted ? <CheckCircle className="mr-1 h-3 w-3"/> : <Hourglass className="mr-1 h-3 w-3"/>}
                {latestEntry.stage}
            </Badge>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-primary/90 flex items-center gap-2"><Factory size={16}/>Gantry Department</h4>
                {getStageBadge(latestEntry.stage)}
            </div>
             <div className="grid grid-cols-1 gap-y-2 text-sm pl-2">
                <DetailItem icon={<Calendar size={14}/>} label="Last Entry Date" value={format(new Date(latestEntry.date), 'MMM d, yyyy')} />
                <DetailItem icon={<GanttChartSquare size={14}/>} label="Gantry/Mold" value={latestEntry.moldNumber} />
                <DetailItem icon={<CircleDot size={14}/>} label="Last Known Stage" value={latestEntry.stage} />
                 {latestEntry.issues && latestEntry.issues !== "None" && (
                    <div className="col-span-2">
                         <DetailItem icon={<AlertTriangle size={14} className="text-destructive"/>} label="Issues Reported" value={latestEntry.issues} />
                    </div>
                 )}
                 {latestEntry.downtimeCaused && (
                     <Badge variant="destructive" className="mt-2"><AlertTriangle className="mr-1 h-3 w-3" /> Downtime Caused</Badge>
                 )}
            </div>
        </div>
    )
}


export function SailStatusCard({ item }: SailStatusCardProps) {
  const { report, filmsInfo, gantryHistory, ...workItem } = item;
  const isCompleted = workItem.endOfShiftStatus === 'Completed';

  return (
    <Card className={cn("flex flex-col transition-all", isCompleted ? "border-green-200 bg-green-50/50 hover:border-green-300" : "border-amber-200 bg-amber-50/50 hover:border-amber-300")}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-bold">{workItem.oeNumber} - {workItem.section}</CardTitle>
                <div className="text-sm text-muted-foreground">
                    <Badge variant={workItem.nestedPanels && workItem.nestedPanels.length > 0 ? "default" : "secondary"}>
                        {workItem.nestedPanels && workItem.nestedPanels.length > 0 ? 'Nested Panels' : 'Individual Panels'}
                    </Badge>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        
         <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-primary/90 flex items-center gap-2"><User size={16}/>Tapeheads Department</h4>
                 <Badge variant={isCompleted ? "default" : "outline"} className={cn(isCompleted ? "bg-green-600" : "border-amber-500 text-amber-600")}>
                    {isCompleted ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                    {workItem.endOfShiftStatus}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-2">
                <DetailItem icon={<User size={14}/>} label="Operator" value={report.operatorName} />
                <DetailItem icon={<Calendar size={14}/>} label="Date Worked" value={format(new Date(report.date), 'MMM d, yyyy')} />
                <DetailItem icon={<CircleDot size={14}/>} label="Material" value={workItem.materialType} />
                <DetailItem icon={<Clock size={14}/>} label="Shift" value={`${report.shift} (${report.shiftStartTime} - ${report.shiftEndTime})`} />
                <DetailItem icon={<Ruler size={14}/>} label="Meters Produced" value={`${workItem.total_meters}m`} />
                <DetailItem icon={<Shapes size={14}/>} label="Tapes Used" value={workItem.total_tapes} />
                {!isCompleted && workItem.layer && (
                    <DetailItem icon={<Layers size={14}/>} label="Current Layer" value={workItem.layer} />
                )}
            </div>
             {workItem.had_spin_out && (
                 <div className="mt-2 p-2 bg-destructive/10 border-l-4 border-destructive rounded">
                    <DetailItem icon={<Wind size={16} className="text-destructive"/>} label="Spin-Out Recorded" value={`${workItem.spin_out_duration_minutes || 'N/A'} min duration`} />
                 </div>
            )}
            
            {workItem.issues && workItem.issues.length > 0 && (
                 <div className="mt-2 p-2 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
                    <DetailItem icon={<AlertTriangle size={16} className="text-yellow-600"/>} label="Problems" value={workItem.issues.map(i => i.problem_reason).join(', ')} />
                 </div>
            )}
        </div>

        <Separator />
        <FilmsStatusSection filmsInfo={filmsInfo} />
        <Separator />
        <GantryStatusSection gantryHistory={gantryHistory} />
        
      </CardContent>
    </Card>
  );
}
