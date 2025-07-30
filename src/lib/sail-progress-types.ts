
export interface ProgressNode {
  id: string;
  name: string;
  status: string;
  details?: Record<string, string | number>;
  children?: ProgressNode[];
}

export interface Section {
  oeNumber: string;
  isHeadSection: boolean;
  suffix: string;
}

export interface Sail {
  sailId: string; // e.g., OAUS32145-00X
  sections: Section[];
  progress: ProgressNode[];
  overallStatus: string;
}
