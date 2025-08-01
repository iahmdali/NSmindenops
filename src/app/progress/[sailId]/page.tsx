
import { SailProgressViewer } from "@/components/progress/sail-progress-viewer";
import { getRecentSails, searchSails } from "@/lib/sail-progress-logic";

export default function SailProgressPage({ params }: { params: { sailId: string } }) {
    const allSails = [...getRecentSails(20), ...searchSails(params.sailId)];
    const sail = allSails.find(s => s.id === params.sailId);
    
    if (!sail) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Sail Not Found</h1>
                <p className="text-muted-foreground">Could not find progress details for sail ID: {params.sailId}</p>
            </div>
        )
    }

    return <SailProgressViewer sail={sail} />;
}
