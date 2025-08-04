
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
        images?: any[];
        downtime_caused?: boolean;
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
        id: "gantry_rpt_new_2",
        report_date: "2023-10-28T12:00:00Z",
        date: "2023-10-28T12:00:00Z",
        shift: "2",
        zone_assignment: "Zone C",
        zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead David" }],
        personnel: [
            { name: "David" },
            { name: "Eve" },
        ],
        molds: [
            {
                mold_number: "Gantry 6 / MOLD 110",
                sails: [
                    { sail_number: "OUS2345-141", stage_of_process: "Lamination Inspection", issues: "Minor cosmetic crease found" },
                ],
                downtime_caused: false,
                images: [],
            },
             {
                mold_number: "Gantry 4 / MOLD 105",
                sails: [
                    { sail_number: "OIT76541-001", stage_of_process: "Grid Base Film Installation", issues: "None" },
                ],
                downtime_caused: false,
                images: [],
            }
        ],
        downtime: [],
        maintenance: [],
    },
    {
        id: "gantry_rpt_new_1",
        report_date: "2023-10-27T12:00:00Z",
        date: "2023-10-27T12:00:00Z",
        shift: "1",
        zone_assignment: "Zone C",
        zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead Charlie" }],
        personnel: [
            { name: "Charlie" },
            { name: "Dana" },
        ],
        molds: [
            {
                mold_number: "Gantry 6 / MOLD 110",
                sails: [
                    { sail_number: "OUS2345-141", stage_of_process: "Lamination", issues: "None" },
                ],
                downtime_caused: false,
                images: [],
            },
        ],
        downtime: [
            { reason: "Planned Maintenance", duration: 60 }
        ],
        maintenance: [],
    },
];
