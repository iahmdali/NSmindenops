
import { DepartmentReportForm } from "@/components/department-report-form";
import { PageHeader } from "@/components/page-header";

export default function TapeheadsOperatorEntryPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Tapeheads Operator Entry"
                description="Fill out the detailed report for your work on this OE section."
            />
            <DepartmentReportForm department="Tapeheads" />
        </div>
    );
}
