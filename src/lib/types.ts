export type Department = 'Pregger' | 'Tapeheads' | 'Gantry' | 'Films' | 'Graphics';

export type Shift = 1 | 2 | 3;

export interface ShiftData {
  name: string;
  total: number;
}

export interface DepartmentData {
  label: Department;
  data: ShiftData[];
}

export interface Report {
  id: string;
  operatorName: string;
  shift: Shift;
  date: Date;
  status: 'Submitted' | 'Approved' | 'Requires Attention';
  comments?: string;
  leadComments?: string;
  endOfShiftStatus?: 'Completed' | 'In Progress';
  layer?: string;
  // Department-specific fields
  [key: string]: any;
}
