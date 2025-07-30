
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
        oe_number: "OE-12345",
        inspector_name: "Inspector 1",
        totalScore: 45, // Pass
    },
    {
        inspection_date: "2023-10-28",
        oe_number: "OE-67890",
        inspector_name: "Inspector 2",
        totalScore: 70, // Requires Reinspection
        reinspection_notes: "Minor shrinkage waves addressed. Accepted after reinspection."
    },
    {
        inspection_date: "2023-10-27",
        oe_number: "OE-ABCDE",
        inspector_name: "Inspector 1",
        totalScore: 110, // Fail
        reinspection_notes: "Major delamination found. Sail rejected."
    },
];
