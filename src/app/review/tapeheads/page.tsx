import { PageHeader } from "@/components/page-header"
import { TapeheadsReviewClient } from "@/components/review/tapeheads-review-client"
import { tapeheadsSubmissions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { TapeheadsReviewSummary } from "@/components/review/tapeheads-review-summary"

export default function TapeheadsReviewPage() {
  return (
    <div>
      <PageHeader
        title="Tapeheads Shift Lead Review"
        description="Review, edit, and aggregate operator entries into a final shift report."
      >
        <Button>Finalize Shift Report</Button>
      </PageHeader>
      
      <div className="space-y-8">
        <TapeheadsReviewSummary submissions={tapeheadsSubmissions} />
        <TapeheadsReviewClient submissions={tapeheadsSubmissions} />
      </div>
    </div>
  )
}
