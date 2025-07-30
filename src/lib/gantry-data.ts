
export interface GantryReport {
    id: string;
    report_date: string;
    date: string;
    shift: string;
    zone_assignment?: string;
    zoneLeads?: Array<{
        zone_number: string;
        lead_name: string;
    }>;
    personnel?: Array<{
        name: string;
        start_time?: string;
        end_time?: string;
    }>;
    molds?: Array<{
        mold_number: string;
        sails?: Array<{
            sail_number: string;
            stage_of_process?: string;
            issues?: string;
        }>;
    }>;
    downtime?: Array<{
        reason: string;
        duration: number;
    }>;
    maintenance?: Array<{
        description: string;
        duration: number;
    }>;
}


export const gantryReportsData: GantryReport[] = [
    {
        id: "gantry_rpt_1",
        report_date: "2023-10-27",
        date: "2023-10-27",
        shift: "1",
        zone_assignment: "Zone A",
        zoneLeads: [{ zone_number: "Zone 1", lead_name: "Lead Alpha" }],
        personnel: [
            { name: "Michael" },
            { name: "Andrew" },
        ],
        molds: [
            {
                mold_number: "MOLD 105",
                sails: [
                    { sail_number: "OUK23456-001", stage_of_process: "Lamination", issues: "None" },
                    { sail_number: "OUK23456-101", stage_of_process: "Panel Installation", issues: "None" },
                ],
            },
        ],
        downtime: [
            { reason: "Mechanical", duration: 30 },
        ],
        maintenance: [],
    },
    {
        id: "gantry_rpt_2",
        report_date: "2023-10-27",
        date: "2023-10-27",
        shift: "2",
        zone_assignment: "Zone B",
        zoneLeads: [{ zone_number: "Zone 2", lead_name: "Lead Bravo" }],
        personnel: [
            { name: "David" },
            { name: "Sophia" },
        ],
        molds: [
            {
                mold_number: "MOLD 109",
                sails: [
                    { sail_number: "OUS79723-001", stage_of_process: "Top Film Installation", issues: "Minor creases noted." },
                ],
            },
        ],
        downtime: [],
        maintenance: [
            { description: "Cleaned mold surface", duration: 45 },
        ],
    },
    {
        id: "gantry_rpt_3",
        report_date: "2023-10-28",
        date: "2023-10-28",
        shift: "1",
        zone_assignment: "Zone A",
        zoneLeads: [{ zone_number: "Zone 1", lead_name: "Lead Alpha" }],
        personnel: [
            { name: "Michael" },
            { name: "Kevin" },
        ],
        molds: [
            {
                mold_number: "MOLD 105",
                sails: [
                    { sail_number: "OAUS32145-002", stage_of_process: "Lamination Inspection", issues: "None" },
                ],
            },
             {
                mold_number: "MOLD 110",
                sails: [
                    { sail_number: "OIT76541-001", stage_of_process: "Grid Base Film Installation", issues: "None" },
                ],
            },
        ],
        downtime: [],
        maintenance: [],
    },
];
