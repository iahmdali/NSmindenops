
export interface PreggerReport {
    id: string;
    report_date: string;
    shift: string;
    workCompleted: Array<{
        tape_id: string;
        meters: number;
        waste_meters: number;
        material_description: string;
    }>;
    personnel: Array<{
        name: string;
        start_time: string;
        end_time: string;
    }>;
    downtime?: Array<{
        reason: string;
        duration_minutes: number;
    }>;
    briefing_items?: string;
    current_work?: string;
    operational_problems?: string;
    personnel_notes?: string;
    bonding_complete?: boolean;
    epa_report?: boolean;
    end_of_shift_checklist?: boolean;
    images?: any;
}


export const preggerReportsData: PreggerReport[] = [
    {
        id: "pregger_rpt_1",
        report_date: "2023-10-27",
        shift: "1",
        workCompleted: [
            { tape_id: "T-101", meters: 2500, waste_meters: 50, material_description: "3Di RAW 760" },
            { tape_id: "T-102", meters: 2300, waste_meters: 45, material_description: "3Di Endurance 780" },
        ],
        personnel: [
            { name: "Operator A", start_time: "06:00", end_time: "14:00" },
            { name: "Operator B", start_time: "06:00", end_time: "14:00" },
        ],
        downtime: [
            { reason: "mechanical", duration_minutes: 45 },
        ],
        bonding_complete: true,
    },
    {
        id: "pregger_rpt_2",
        report_date: "2023-10-27",
        shift: "2",
        workCompleted: [
            { tape_id: "T-103", meters: 3000, waste_meters: 60, material_description: "3Di OCEAN 370" },
        ],
        personnel: [
            { name: "Operator C", start_time: "14:00", end_time: "22:00" },
            { name: "Operator D", start_time: "14:00", end_time: "22:00" },
        ],
        downtime: [
             { reason: "material", duration_minutes: 20 },
        ],
    },
    {
        id: "pregger_rpt_3",
        report_date: "2023-10-26",
        shift: "3",
        workCompleted: [
            { tape_id: "T-101", meters: 2800, waste_meters: 70, material_description: "3Di RAW 760" },
        ],
        personnel: [
            { name: "Operator E", start_time: "22:00", end_time: "06:00" },
        ],
        downtime: [],
    },
];
