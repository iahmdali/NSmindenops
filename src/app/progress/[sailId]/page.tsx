
import { SailProgressViewer } from "@/components/progress/sail-progress-viewer";

export default function SailProgressPage({ params }: { params: { sailId: string } }) {
    return <SailProgressViewer sailId={params.sailId} />;
}
