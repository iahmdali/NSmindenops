
export interface OeSection {
  sectionId: string;
  panelStart: number;
  panelEnd: number;
  completedPanels?: string[];
}

export interface OeJob {
  id: string;
  oeBase: string;
  status: 'pending' | 'in-progress' | 'completed';
  sections: OeSection[];
}


// This will act as our in-memory "database" for OE jobs created by the File System module.
export let oeJobs: OeJob[] = [
  { 
    id: 'job-1',
    oeBase: 'OUS2345', 
    status: 'completed',
    sections: [
      { sectionId: '141', panelStart: 1, panelEnd: 10, completedPanels: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"] },
    ]
  },
  { 
    id: 'job-2',
    oeBase: 'OIT76541', 
    status: 'in-progress',
    sections: [
      { sectionId: '001', panelStart: 1, panelEnd: 8, completedPanels: ["P1", "P2", "P3"] },
      { sectionId: '002', panelStart: 1, panelEnd: 5, completedPanels: ["P1", "P2", "P3", "P4", "P5"] }
    ]
  },
   { 
    id: 'job-3',
    oeBase: 'OAUS32145', 
    status: 'completed',
    sections: [
        { sectionId: '001', panelStart: 1, panelEnd: 12, completedPanels: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"] },
    ]
  },
];

// Function to add new jobs from the file system module
export function addOeJob(job: { oeBase: string, sections: Array<{ sectionId: string, panelStart: number, panelEnd: number }> }) {
  const newJob: OeJob = {
    id: `job-${Date.now()}`,
    oeBase: job.oeBase,
    status: 'pending',
    sections: job.sections.map(s => ({ ...s, completedPanels: [] })),
  };
  oeJobs.unshift(newJob);
}

export function getOeSection(oeBase?: string, sectionId?: string): (OeSection & { jobStatus: OeJob['status']}) | undefined {
  if (!oeBase || !sectionId) return undefined;
  const job = oeJobs.find(j => j.oeBase === oeBase);
  if (!job) return undefined;
  
  const section = job.sections.find(s => s.sectionId === sectionId);
  if (!section) return undefined;

  return { ...section, jobStatus: job.status };
}


export function markPanelsAsCompleted(oeBase: string, sectionId: string, panels: string[]) {
    const job = oeJobs.find(j => j.oeBase === oeBase);
    if (!job) return;

    const section = job.sections.find(s => s.sectionId === sectionId);
    if (!section) return;

    if (!section.completedPanels) {
        section.completedPanels = [];
    }
    const newPanels = panels.filter(p => !section.completedPanels!.includes(p));
    section.completedPanels.push(...newPanels);

    // Optional: Update overall job status if all sections are complete
    const allSectionsComplete = job.sections.every(s => {
        const totalPanels = s.panelEnd - s.panelStart + 1;
        return (s.completedPanels?.length || 0) >= totalPanels;
    });

    if (allSectionsComplete) {
        job.status = 'completed';
    } else if (job.sections.some(s => (s.completedPanels?.length || 0) > 0)) {
        job.status = 'in-progress';
    }
}
