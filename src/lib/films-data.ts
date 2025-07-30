
export interface FilmsReport {
  report_date: string;
  shift_lead_name: string;
  shift_type: 'Morning' | 'Night';
  crew_members: { name: string; shift_time: string; crew_type: "Films Crew" | "Joining Crew" }[];
  sail_preparations: {
    gantry_mold: string;
    sail_number: string;
    prep_date: string;
    status_in_progress: boolean;
    status_done: boolean;
    issue_notes?: string;
  }[];
  oops_report_info?: string;
  images?: any[];
}

export const filmsReportsData: FilmsReport[] = [
  {
    report_date: '2023-10-27',
    shift_lead_name: 'Lead D',
    shift_type: 'Morning',
    crew_members: [
      { name: 'Film Crew 1', shift_time: '06:00-14:00', crew_type: 'Films Crew' },
      { name: 'Joining Crew 1', shift_time: '06:00-14:00', crew_type: 'Joining Crew' },
    ],
    sail_preparations: [
      {
        gantry_mold: 'Gantry 4/MOLD 105',
        sail_number: 'OUS79723-001',
        prep_date: '2023-10-27',
        status_in_progress: false,
        status_done: true,
        issue_notes: 'Minor wrinkle on edge, corrected.'
      },
      {
        gantry_mold: 'Gantry 6/MOLD 109',
        sail_number: 'OUS79723-101',
        prep_date: '2023-10-27',
        status_in_progress: true,
        status_done: false,
      }
    ]
  },
  {
    report_date: '2023-10-26',
    shift_lead_name: 'Lead E',
    shift_type: 'Night',
    crew_members: [
      { name: 'Film Crew 2', shift_time: '14:00-22:00', crew_type: 'Films Crew' },
    ],
    sail_preparations: [
      {
        gantry_mold: 'Gantry 8/MOLD 100',
        sail_number: 'OAUS32145-001',
        prep_date: '2023-10-26',
        status_in_progress: false,
        status_done: true,
      }
    ]
  }
];
