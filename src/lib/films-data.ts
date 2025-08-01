
export interface FilmsReport {
    id: string;
    report_date: string;
    gantry_number: string;
    sails_started?: Array<{ sail_number: string; comments?: string }>;
    sails_finished?: Array<{ sail_number: string; comments?: string }>;
}

export const filmsData: FilmsReport[] = [
    {
        id: "films_rpt_1",
        report_date: "2023-10-26",
        gantry_number: "4",
        sails_started: [
            { sail_number: "OUK23456-001", comments: "Started base film." },
            { sail_number: "OAUS32145-002", comments: "First film layer down." }
        ],
    },
    {
        id: "films_rpt_2",
        report_date: "2023-10-27",
        gantry_number: "6",
        sails_finished: [
             { sail_number: "OUK23456-001", comments: "Top film applied and sealed." }
        ],
        sails_started: [
            { sail_number: "OUS79723-001", comments: "Started film process."}
        ]
    },
     {
        id: "films_rpt_3",
        report_date: "2023-10-28",
        gantry_number: "5",
        sails_finished: [
            { sail_number: "OAUS32145-002", comments: "Finished and moved to Gantry." }
        ]
    }
];
