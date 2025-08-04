
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
        id: "gantry_rpt_new_1",
        report_date: "2023-10-27",
        date: "2023-10-27",
        shift: "1",
        zone_assignment: "Zone C",
        zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead Charlie" }],
        personnel: [
            { name: "Charlie" },
            { name: "Dana" },
        ],
        molds: [
            {
                mold_number: "MOLD 111",
                sails: [
                    { sail_number: "OUS2345-141", stage_of_process: "Lamination", issues: "None" },
                ],
            },
        ],
        downtime: [],
        maintenance: [],
    },
];
