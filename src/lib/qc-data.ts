
export interface QCInspection {
    inspection_date: string;
    oe_number: string;
    inspector_name: string;
    totalScore: number;
    reinspection_notes?: string;
}

export const qcInspectionData: QCInspection[] = [
    {
        inspection_date: "2023-10-28",
        oe_number: "OUS79723-001",
        inspector_name: "Inspector 1",
        totalScore: 45, // Pass
    },
    {
        inspection_date: "2023-10-28",
        oe_number: "OIT76541-001",
        inspector_name: "Inspector 2",
        totalScore: 70, // Requires Reinspection
        reinspection_notes: "Minor shrinkage waves addressed. Accepted after reinspection."
    },
    {
        inspection_date: "2023-10-27",
        oe_number: "OAUS32145-001",
        inspector_name: "Inspector 1",
        totalScore: 110, // Fail
        reinspection_notes: "Major delamination found. Sail rejected."
    },
];
