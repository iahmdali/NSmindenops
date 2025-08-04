
import type { Report } from '@/lib/types';

// More detailed mock data aligning with the new operator form
export let tapeheadsSubmissions: Report[] = [
    {
        id: "rpt_1",
        date: new Date("2023-10-27T12:00:00Z"),
        shift: 1,
        shiftLeadName: "John Doe",
        thNumber: "TH-3",
        operatorName: "Alice",
        shiftStartTime: "06:00",
        shiftEndTime: "14:00",
        status: "Submitted",
        total_meters: 1500,
        workItems: [
            {
                oeNumber: "OUK23456-001",
                section: "101",
                materialType: "Carbon",
                endOfShiftStatus: "Completed",
                total_meters: 1500,
                total_tapes: 4,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2", "P3"],
            }
        ]
    },
    {
        id: "rpt_2",
        date: new Date("2023-10-27T12:00:00Z"),
        shift: 2,
        shiftLeadName: "Jane Smith",
        thNumber: "TH-5",
        operatorName: "Bob",
        shiftStartTime: "14:00",
        shiftEndTime: "22:00",
        status: "Submitted",
        total_meters: 2200,
        workItems: [
            {
                oeNumber: "OAUS32145-002",
                section: "002",
                materialType: "Kevlar",
                endOfShiftStatus: "In Progress",
                layer: "8 of 15",
                total_meters: 2200,
                total_tapes: 6,
                had_spin_out: true,
                spin_out_duration_minutes: 30,
                panelsWorkedOn: ["P4", "P5"],
            }
        ]
    },
];
