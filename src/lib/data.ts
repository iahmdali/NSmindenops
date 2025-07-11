import type { DepartmentData, Report } from '@/lib/types';

export const analyticsData: DepartmentData[] = [
  {
    label: 'Pregger',
    data: [
      { name: 'Shift 1', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 2', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 3', total: Math.floor(Math.random() * 5000) },
    ],
  },
  {
    label: 'Tapeheads',
    data: [
      { name: 'Shift 1', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 2', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 3', total: Math.floor(Math.random() * 5000) },
    ],
  },
  {
    label: 'Gantry',
    data: [
      { name: 'Shift 1', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 2', total: Math.floor(Math.random() * 5000) },
      { name: 'Shift 3', total: Math.floor(Math.random() * 5000) },
    ],
  },
  {
    label: 'Films',
    data: [{ name: 'Full Day', total: Math.floor(Math.random() * 5000) }],
  },
  {
    label: 'Graphics',
    data: [{ name: 'Full Day', total: Math.floor(Math.random() * 5000) }],
  },
];

export const tapeheadsSubmissions: Report[] = [
  {
    id: 'rpt_001',
    operatorName: 'B. Johnson',
    shift: 1,
    date: new Date('2023-10-27T08:00:00Z'),
    status: 'Approved',
    materialId: 'M-456',
    tasksCompleted: 15,
    downtime: 0.5,
    comments: 'All tasks completed successfully.',
    leadComments: 'Good work.'
  },
  {
    id: 'rpt_002',
    operatorName: 'S. Davis',
    shift: 1,
    date: new Date('2023-10-27T08:30:00Z'),
    status: 'Requires Attention',
    materialId: 'M-457',
    tasksCompleted: 12,
    downtime: 1.0,
    comments: 'Machine B had a minor issue, required a reset.',
    leadComments: 'Please provide more details on the machine issue.'
  },
  {
    id: 'rpt_003',
    operatorName: 'A. Miller',
    shift: 2,
    date: new Date('2023-10-27T16:15:00Z'),
    status: 'Submitted',
    materialId: 'M-458',
    tasksCompleted: 18,
    downtime: 0,
    comments: 'Productive shift.',
  },
  {
    id: 'rpt_004',
    operatorName: 'C. Wilson',
    shift: 2,
    date: new Date('2023-10-27T16:45:00Z'),
    status: 'Submitted',
    materialId: 'M-459',
    tasksCompleted: 16,
    downtime: 0.25,
    comments: 'Waiting on materials for final task.',
  },
  {
    id: 'rpt_005',
    operatorName: 'T. Moore',
    shift: 3,
    date: new Date('2023-10-28T00:30:00Z'),
    status: 'Submitted',
    materialId: 'M-460',
    tasksCompleted: 20,
    downtime: 0,
    comments: 'Smooth operation.',
  },
];
