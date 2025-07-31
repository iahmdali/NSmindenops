
import { TapeheadsReviewSummary } from "@/components/review/tapeheads-review-summary";
import { PageHeader } from "@/components/page-header";

export default function TapeheadsReviewPage() {
  return (
    <div className="space-y-6">
       <PageHeader
        title="Tapeheads Review & Finalize"
        description="Shift lead dashboard for reviewing operator submissions and finalizing."
      />
      <TapeheadsReviewSummary />
    </div>
  );
}
