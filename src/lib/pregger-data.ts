export interface PreggerReport {
  id: string;
  report_date: string;
  shift: 1 | 2 | 3;
  workCompleted: {
    tape_id: string;
    meters: number;
    waste_meters: number;
    material_description: string;
  }[];
  personnel: {
    name: string;
    start_time: string;
    end_time: string;
  }[];
  downtime?: {
    reason: 'mechanical' | 'electrical' | 'material' | 'other';
    duration_minutes: number;
  }[];
}

export const preggerReportsData: PreggerReport[] = [
  {
    id: 'preg_001',
    report_date: '2023-10-27',
    shift: 1,
    workCompleted: [
      { tape_id: 'T-101', meters: 1500, waste_meters: 50, material_description: 'Carbon 3Di' },
      { tape_id: 'T-102', meters: 1200, waste_meters: 30, material_description: 'Aramid 3Di' },
    ],
    personnel: [
      { name: 'John Doe', start_time: '06:00', end_time: '14:00' },
      { name: 'Jane Smith', start_time: '06:00', end_time: '14:00' },
    ],
    downtime: [
      { reason: 'mechanical', duration_minutes: 45 },
    ],
  },
  {
    id: 'preg_002',
    report_date: '2023-10-27',
    shift: 2,
    workCompleted: [
      { tape_id: 'T-103', meters: 1800, waste_meters: 70, material_description: 'Polyester 3Di' },
    ],
    personnel: [
      { name: 'Peter Jones', start_time: '14:00', end_time: '22:00' },
      { name: 'Mary Williams', start_time: '14:00', end_time: '22:00' },
    ],
    downtime: [
       { reason: 'material', duration_minutes: 20 },
       { reason: 'electrical', duration_minutes: 30 },
    ],
  },
  {
    id: 'preg_003',
    report_date: '2023-10-27',
    shift: 3,
    workCompleted: [
      { tape_id: 'T-101', meters: 2000, waste_meters: 60, material_description: 'Carbon 3Di' },
    ],
    personnel: [
       { name: 'David Brown', start_time: '22:00', end_time: '06:00' },
    ],
  },
  {
    id: 'preg_004',
    report_date: '2023-10-26',
    shift: 1,
    workCompleted: [
      { tape_id: 'T-101', meters: 1400, waste_meters: 40, material_description: 'Carbon 3Di' },
      { tape_id: 'T-102', meters: 1300, waste_meters: 25, material_description: 'Aramid 3Di' },
    ],
    personnel: [
      { name: 'John Doe', start_time: '06:00', end_time: '14:00' },
      { name: 'Jane Smith', start_time: '06:00', end_time: '14:00' },
    ],
    downtime: [
      { reason: 'other', duration_minutes: 15 },
    ],
  },
   {
    id: 'preg_005',
    report_date: '2023-10-26',
    shift: 2,
    workCompleted: [
      { tape_id: 'T-103', meters: 1750, waste_meters: 80, material_description: 'Polyester 3Di' },
    ],
    personnel: [
      { name: 'Peter Jones', start_time: '14:00', end_time: '22:00' },
      { name: 'Mary Williams', start_time: '14:00', end_time: '22:00' },
    ],
  },
   {
    id: 'preg_006',
    report_date: '2023-10-25',
    shift: 1,
    workCompleted: [
      { tape_id: 'T-101', meters: 1550, waste_meters: 55, material_description: 'Carbon 3Di' },
    ],
    personnel: [
      { name: 'John Doe', start_time: '06:00', end_time: '14:00' },
      { name: 'Jane Smith', start_time: '06:00', end_time: '14:00' },
    ],
    downtime: [
        { reason: 'mechanical', duration_minutes: 60 },
        { reason: 'electrical', duration_minutes: 20 },
    ]
  },
];
