import { PageHeader } from "@/components/page-header";
import { ThreeDiInspectionForm } from "@/components/qc/3di-inspection-form";

export default function ThreeDiInspectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="3Di QC Inspection"
        description="Digitized ScoreCard for detailed quality control inspection of 3Di sails."
      />
      <ThreeDiInspectionForm />
    </div>
  );
}
