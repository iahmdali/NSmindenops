import { TapeheadsOeTracker } from "@/components/review/tapeheads-oe-tracker";
import { PageHeader } from "@/components/page-header";

export default function TapeheadsReviewPage() {
  return (
    <div className="space-y-6">
       <PageHeader
        title="Tapeheads Review"
        description="Shift lead dashboard for reviewing and finalizing Tapeheads reports."
      />
      <TapeheadsOeTracker />
    </div>
  );
}
