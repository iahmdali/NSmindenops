
import { OeTracker } from "@/components/filesystem/oe-tracker";
import { PageHeader } from "@/components/page-header";

export default function FileSystemPage() {
  return (
    <div className="space-y-6">
       <PageHeader
        title="File System Module"
        description="Register a new OE job and define its sections for the Tapeheads department."
      />
      <OeTracker />
    </div>
  );
}
