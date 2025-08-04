
export interface FilmsReport {
    report_date: string;
    gantry_number: string;
    sails_started: Array<{ sail_number: string; comments?: string }>;
    sails_finished: Array<{ sail_number: string; comments?: string }>;
}

// Mock data for the Films department.
// In a real application, this would come from a database.
export const filmsData: FilmsReport[] = [
    {
        report_date: "2023-10-26T12:00:00Z",
        gantry_number: "4",
        sails_started: [{ sail_number: "OUK23456-001" }],
        sails_finished: [],
    },
    {
        report_date: "2023-10-27T12:00:00Z",
        gantry_number: "4",
        sails_started: [],
        sails_finished: [{ sail_number: "OUK23456-001", comments: "Ready for Gantry 4." }],
    },
    {
        report_date: "2023-10-27T12:00:00Z",
        gantry_number: "6",
        sails_started: [{ sail_number: "OAUS32145-002" }],
        sails_finished: [],
    },
];
