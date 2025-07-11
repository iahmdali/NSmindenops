"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Report } from "@/lib/types"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Sparkles } from "lucide-react"

interface SummaryProps {
  submissions: Report[];
  generatedSummary: string;
  onGenerateSummary: () => void;
  isGeneratingSummary: boolean;
}

export function TapeheadsReviewSummary({ submissions, generatedSummary, onGenerateSummary, isGeneratingSummary }: SummaryProps) {
  const summary = React.useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        total_meters: 0,
        total_tapes: 0,
        total_hours_worked: 0,
        average_mph: 0,
        total_downtime: 0,
        total_spin_outs: 0,
      }
    }

    const total_meters = submissions.reduce((acc, s) => acc + (s.total_meters || 0), 0)
    const total_tapes = submissions.reduce((acc, s) => acc + (s.total_tapes || 0), 0)
    
    const total_downtime = submissions.reduce((acc, s) => {
        const problem_downtime = s.issues?.reduce((iAcc: number, i: any) => iAcc + (i.duration_minutes || 0), 0) || 0;
        const spin_out_downtime = s.had_spin_out ? (s.spin_out_duration_minutes || 0) : 0;
        return acc + problem_downtime + spin_out_downtime;
    }, 0)

    const total_spin_outs = submissions.filter(s => s.had_spin_out).length
    
    const total_hours_worked = submissions.reduce((acc, s) => {
      if (!s.shift_start_time || !s.shift_end_time) return acc;
      const [startH, startM] = s.shift_start_time.split(':').map(Number);
      const [endH, endM] = s.shift_end_time.split(':').map(Number);
      const startDate = new Date(0,0,0,startH, startM);
      let endDate = new Date(0,0,0,endH, endM);
      if(endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      return acc + diff;
    }, 0);

    const average_mph = total_hours_worked > 0 ? (total_meters / total_hours_worked).toFixed(2) : 0;

    return {
      total_meters,
      total_tapes,
      total_hours_worked: parseFloat(total_hours_worked.toFixed(2)),
      average_mph,
      total_downtime,
      total_spin_outs,
    }
  }, [submissions])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Final Shift Report</CardTitle>
        <CardDescription>
          Shift Lead Authority: Full editing control over all final report metrics and summaries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-meters">Total Meters (Shift Lead Editable)</Label>
            <Input id="total-meters" defaultValue={summary.total_meters} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-tapes">Total Tapes (Shift Lead Editable)</Label>
            <Input id="total-tapes" defaultValue={summary.total_tapes} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-hours">Total Hours Worked</Label>
            <Input id="total-hours" value={`${summary.total_hours_worked}h`} readOnly className="bg-muted font-mono"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg-mph">Average MPMH</Label>
            <Input id="avg-mph" value={`${summary.average_mph} m/hr`} readOnly className="bg-muted font-mono text-blue-600 font-bold"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-downtime">Total Downtime</Label>
            <Input id="total-downtime" value={`${summary.total_downtime} min`} readOnly className="bg-muted font-mono"/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="total-spin-outs">Total Spin Outs</Label>
            <Input id="total-spin-outs" value={summary.total_spin_outs} readOnly className="bg-muted font-mono"/>
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="lead-comments">Shift-wide Comments (Optional)</Label>
            <Textarea id="lead-comments" placeholder="Add any shift-wide observations, notes, or comments..."/>
        </div>
         <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="op-summary">Operational Summary (Shift Lead Full Authority)</Label>
              <Button variant="ghost" size="sm" onClick={onGenerateSummary} disabled={isGeneratingSummary}>
                <Sparkles className="mr-2 h-4 w-4"/>
                {isGeneratingSummary ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea id="op-summary" value={generatedSummary} placeholder="Click 'Generate with AI' to create a summary of the shift's activities." className="min-h-[100px]"/>
        </div>
         <div className="space-y-2">
            <Label htmlFor="lead-name">Shift Lead Name</Label>
            <Input id="lead-name" placeholder="Enter your name"/>
        </div>
      </CardContent>
    </Card>
  )
}
