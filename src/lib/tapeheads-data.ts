
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
    {
        id: "rpt_2_new",
        date: new Date("2023-10-27T20:00:00Z"),
        shift: 2,
        shiftLeadName: "John Doe",
        thNumber: "TH-5",
        operatorName: "Bob",
        shiftStartTime: "14:00",
        shiftEndTime: "22:00",
        status: "Submitted",
        total_meters: 3100,
        workItems: [
            {
                oeNumber: "OIT76541",
                section: "001",
                materialType: "Kevlar",
                endOfShiftStatus: "In Progress",
                layer: "7 of 15",
                total_meters: 1800,
                total_tapes: 6,
                had_spin_out: true,
                spin_out_duration_minutes: 25,
                panelsWorkedOn: ["P1", "P2", "P3"],
            },
            {
                oeNumber: "OIT76541",
                section: "002",
                materialType: "Kevlar",
                endOfShiftStatus: "Completed",
                total_meters: 1300,
                total_tapes: 4,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2"],
                issues: [{ problem_reason: 'Machine Jam', duration_minutes: 15 }]
            }
        ]
    },
    {
        id: "rpt_3_new",
        date: new Date("2023-10-26T12:00:00Z"),
        shift: 1,
        shiftLeadName: "Jane Smith",
        thNumber: "TH-3",
        operatorName: "Charlie",
        shiftStartTime: "06:00",
        shiftEndTime: "14:00",
        status: "Approved",
        total_meters: 4500,
        workItems: [
            {
                oeNumber: "OAUS32145",
                section: "001",
                materialType: "Polyester",
                endOfShiftStatus: "Completed",
                total_meters: 4500,
                total_tapes: 12,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"],
            }
        ]
    }
];

