"use client"

import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { TapeheadsReviewClient } from "@/components/review/tapeheads-review-client"
import { tapeheadsSubmissions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { TapeheadsReviewSummary } from "@/components/review/tapeheads-review-summary"
import type { Report } from "@/lib/types"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { summarizeShift } from "@/ai/flows/summarize-shift-flow"

export default function TapeheadsReviewPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date("2023-10-27"))
  const [shift, setShift] = React.useState<string>("1")
  const [submissions, setSubmissions] = React.useState<Report[]>(tapeheadsSubmissions)
  const [summary, setSummary] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleFilter = () => {
    // This is where you would fetch data from your backend based on date and shift
    console.log("Filtering for", date, shift)
    // For now, we'll just use the static data
    setSubmissions(tapeheadsSubmissions.filter(s => s.shift === parseInt(shift)))
  }
  
  React.useEffect(() => {
    handleFilter();
  }, [date, shift])

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const result = await summarizeShift(submissions);
      setSummary(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Could not generate summary.");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="3Di Shift Lead Review & Final Submission"
        description="Enhanced Shift Lead Authority: Full edit control over individual operator entries and final shift report."
      >
        <Button>Finalize Shift Report</Button>
      </PageHeader>

      <div className="flex items-end gap-4 p-4 border rounded-lg bg-card">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <DatePicker value={date} onChange={setDate} />
        </div>
        <div className="grid gap-2">
           <Label htmlFor="shift">Shift</Label>
           <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="w-[180px]" id="shift">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Shift 1</SelectItem>
                <SelectItem value="2">Shift 2</SelectItem>
                <SelectItem value="3">Shift 3</SelectItem>
              </SelectContent>
            </Select>
        </div>
         <Button onClick={handleFilter}>Filter</Button>
      </div>
      
      <TapeheadsReviewSummary 
        submissions={submissions} 
        generatedSummary={summary}
        onGenerateSummary={handleGenerateSummary}
        isGeneratingSummary={isGenerating}
      />
      <TapeheadsReviewClient submissions={submissions} />
    </div>
  )
}
