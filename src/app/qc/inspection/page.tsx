
import { PageHeader } from "@/components/page-header";
import { ThreeDiInspectionForm } from "@/components/qc/3di-inspection-form";

export default function QcInspectionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="3Di QC Inspection"
        description="Complete the full quality control inspection for a sail section."
      />
      <ThreeDiInspectionForm />
    </div>
  );
}
