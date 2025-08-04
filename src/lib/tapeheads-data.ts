
import type { Report } from '@/lib/types';

// More detailed mock data aligning with the new operator form
export let tapeheadsSubmissions: Report[] = [
    {
        id: "rpt_1_new",
        date: new Date("2023-10-27T12:00:00Z"),
        shift: 1,
        shiftLeadName: "John Doe",
        thNumber: "TH-3",
        operatorName: "Alice",
        shiftStartTime: "06:00",
        shiftEndTime: "14:00",
        status: "Submitted",
        total_meters: 2500,
        workItems: [
            {
                oeNumber: "OUS2345",
                section: "141",
                materialType: "Carbon",
                endOfShiftStatus: "Completed",
                total_meters: 2500,
                total_tapes: 8,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"],
            }
        ]
    },
];
