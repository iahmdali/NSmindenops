
import { DepartmentReportForm } from "@/components/department-report-form";
import { PageHeader } from "@/components/page-header";
import { OeSection, getOeSection } from "@/lib/oe-data";
import { notFound } from "next/navigation";

export default function TapeheadsOperatorEntryPage({
    searchParams
}: {
    searchParams: { oe?: string, section?: string }
}) {
    const { oe, section } = searchParams;
    const oeSection: OeSection | undefined = getOeSection(oe, section);
    
    if (!oe || !section || !oeSection) {
        notFound();
    }
    
    const title = `${oe}-${section}`;

    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                description="Fill out the detailed report for your work on this OE section."
            />
            <DepartmentReportForm department="Tapeheads" oeSection={oeSection}/>
        </div>
    );
}
