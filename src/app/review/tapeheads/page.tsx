import { PageHeader } from "@/components/page-header"
import { TapeheadsReviewClient } from "@/components/review/tapeheads-review-client"
import { tapeheadsSubmissions } from "@/lib/data"
import { Button } from "@/components/ui/button"

export default function TapeheadsReviewPage() {
  return (
    <div>
      <PageHeader
        title="Tapeheads Review"
        description="Review, edit, and approve shift reports submitted by operators."
      >
        <Button>Finalize Shift Report</Button>
      </PageHeader>
      <TapeheadsReviewClient submissions={tapeheadsSubmissions} />
    </div>
  )
}
