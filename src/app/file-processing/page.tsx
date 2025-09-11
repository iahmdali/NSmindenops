
import { FileProcessingTracker } from "@/components/file-processing/file-processing-tracker";
import { PageHeader } from "@/components/page-header";

export default function FileProcessingPage() {
  return (
    <div className="space-y-6">
       <PageHeader
        title="File Processing Module"
        description="Register a new OE job and define its sections for the Tapeheads department."
      />
      <FileProcessingTracker />
    </div>
  );
}
