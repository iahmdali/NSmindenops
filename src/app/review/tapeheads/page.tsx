import { TapeheadsOeTracker } from "@/components/review/tapeheads-oe-tracker";
import { TapeheadsReviewSummary } from "@/components/review/tapeheads-review-summary";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";

export default function TapeheadsReviewPage() {
  return (
    <div className="space-y-6">
       <PageHeader
        title="Tapeheads Review & Finalize"
        description="Shift lead dashboard for reviewing operator submissions and initializing new OE jobs."
      />
      <TapeheadsReviewSummary />
      <Separator className="my-8" />
      <TapeheadsOeTracker />
    </div>
  );
}
