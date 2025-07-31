
export interface OeSection {
  id: string;
  oeBase: string;
  sectionId: string;
  panelStart: number;
  panelEnd: number;
  status: 'pending' | 'in-progress' | 'completed';
  completedPanels?: string[];
}

// This will act as our in-memory "database" for OE jobs created by the File System module.
export let oeJobs: OeSection[] = [
  { id: 'sec-1', oeBase: 'OAUS32162', sectionId: '001', panelStart: 1, panelEnd: 5, status: 'pending', completedPanels: [] },
  { id: 'sec-2', oeBase: 'OAUS32162', sectionId: '101', panelStart: 6, panelEnd: 13, status: 'pending', completedPanels: [] },
  { id: 'sec-3', oeBase: 'OIT76541', sectionId: '001', panelStart: 1, panelEnd: 12, status: 'in-progress', completedPanels: ['P1', 'P2'] },
];

// Function to add new jobs from the file system module
export function addOeJob(job: { oeBase: string, sections: Array<{ sectionId: string, panelStart: number, panelEnd: number }> }) {
  const newSections: OeSection[] = job.sections.map((s, i) => ({
    id: `sec-${Date.now()}-${i}`,
    oeBase: job.oeBase,
    sectionId: s.sectionId,
    panelStart: s.panelStart,
    panelEnd: s.panelEnd,
    status: 'pending',
    completedPanels: [],
  }));
  oeJobs.unshift(...newSections);
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

export function markPanelsAsCompleted(oeBase: string, sectionId: string, panels: string[]) {
    const job = oeJobs.find(j => j.oeBase === oeBase && j.sectionId === sectionId);
    if (job) {
        if (!job.completedPanels) {
            job.completedPanels = [];
        }
        const newPanels = panels.filter(p => !job.completedPanels!.includes(p));
        job.completedPanels.push(...newPanels);

        // Optional: Update overall status if all panels are complete
        const totalPanels = (job.panelEnd - job.panelStart + 1);
        if (job.completedPanels.length >= totalPanels) {
            job.status = 'completed';
        } else if (job.completedPanels.length > 0) {
            job.status = 'in-progress';
        }
    }
}
