
export interface OeSection {
  id: string;
  oeBase: string;
  sectionId: string;
  panels: number;
  status: 'pending' | 'in-progress' | 'completed';
}

// This will act as our in-memory "database" for OE jobs created by the File System module.
export let oeJobs: OeSection[] = [
  { id: 'sec-1', oeBase: 'OAUS32162', sectionId: '001', panels: 5, status: 'pending' },
  { id: 'sec-2', oeBase: 'OAUS32162', sectionId: '101', panels: 8, status: 'pending' },
  { id: 'sec-3', oeBase: 'OIT76541', sectionId: '001', panels: 12, status: 'in-progress' },
];

// Function to add new jobs from the file system module
export function addOeJob(job: { oeBase: string, sections: Array<{ sectionId: string, panels: number }> }) {
  const newSections: OeSection[] = job.sections.map((s, i) => ({
    id: `sec-${Date.now()}-${i}`,
    oeBase: job.oeBase,
    sectionId: s.sectionId,
    panels: s.panels,
    status: 'pending'
  }));
  oeJobs.push(...newSections);
}

export function getOeSection(oeBase?: string, sectionId?: string): OeSection | undefined {
  if (!oeBase || !sectionId) return undefined;
  return oeJobs.find(job => job.oeBase === oeBase && job.sectionId === sectionId);
}

export function updateOeSectionStatus(sectionId: string, status: OeSection['status']) {
    const jobIndex = oeJobs.findIndex(job => job.id === sectionId);
    if (jobIndex !== -1) {
        oeJobs[jobIndex].status = status;
    }
}
