
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Report } from "@/lib/types"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface SummaryProps {
  submissions: Report[]
}

export function TapeheadsReviewSummary({ submissions }: SummaryProps) {
  const summary = React.useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return {
        total_meters: 0,
        total_tapes: 0,
        total_hours_worked: 0,
        average_mph: 0,
        total_downtime: 0,
        total_spin_outs: 0,
        operational_summary: "No submissions yet.",
      }
    }

    const total_meters = submissions.reduce((acc, s) => acc + (s.total_meters || 0), 0)
    const total_tapes = submissions.reduce((acc, s) => acc + (s.total_tapes || 0), 0)
    const total_downtime = submissions.reduce((acc, s) => {
        return acc + (s.issues?.reduce((iAcc: number, i: any) => iAcc + (i.duration_minutes || 0), 0) || 0)
    }, 0)
    const total_spin_outs = submissions.filter(s => s.had_spin_out).length
    
    // This is a placeholder for a more complex calculation
    const total_hours_worked = submissions.length * 8; 
    const average_mph = total_hours_worked > 0 ? (total_meters / total_hours_worked).toFixed(2) : 0;

    const operational_summary = submissions.map(s => `${s.operatorName}: ${s.total_meters || 0}m`).join('; ');

    return {
      total_meters,
      total_tapes,
      total_hours_worked,
      average_mph,
      total_downtime,
      total_spin_outs,
      operational_summary
    }
  }, [submissions])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Final Shift Report Summary</CardTitle>
        <CardDescription>
          This section aggregates data from all operator entries for the selected shift. Edit values before finalizing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-meters">Total Meters</Label>
            <Input id="total-meters" value={summary.total_meters} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-tapes">Total Tapes</Label>
            <Input id="total-tapes" value={summary.total_tapes} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-hours">Total Hours</Label>
            <Input id="total-hours" value={summary.total_hours_worked} readOnly className="bg-muted"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg-mph">Avg. MPH</Label>
            <Input id="avg-mph" value={summary.average_mph} readOnly className="bg-muted"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-downtime">Total Downtime (min)</Label>
            <Input id="total-downtime" value={summary.total_downtime} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="total-spin-outs">Total Spin Outs</Label>
            <Input id="total-spin-outs" value={summary.total_spin_outs} />
          </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="op-summary">Operational Summary</Label>
            <Textarea id="op-summary" value={summary.operational_summary} readOnly className="bg-muted"/>
        </div>
         <div className="space-y-2">
            <Label htmlFor="lead-comments">Shift Lead Comments</Label>
            <Textarea id="lead-comments" placeholder="Add final comments for the shift..."/>
        </div>
      </CardContent>
    </Card>
  )
}
