
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
        gantry_number: "5",
        sails_started: [],
        sails_finished: [{ sail_number: "OUS2345-141", comments: "Ready for Gantry 5." }],
    },
];
