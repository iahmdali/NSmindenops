
import { DepartmentReportForm } from "@/components/department-report-form";
import { PageHeader } from "@/components/page-header";

export default function TapeheadsOperatorEntryPage({
    searchParams
}: {
    searchParams: { oe?: string, section?: string }
}) {
    const { oe, section } = searchParams;
    const title = oe && section ? `${oe}-${section}` : 'Tapeheads Operator Entry';

    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                description="Fill out the detailed report for your work on this OE section."
            />
            <DepartmentReportForm department="Tapeheads" />
        </div>
    );
}
