
/**
 * @fileoverview This file serves as the single, centralized in-memory data store for the application.
 * All mock data arrays and data modification functions are consolidated here. This ensures that all parts
 * of the application read from and write to the same data source, enabling a multi-user experience
 * where changes made by one user are reflected for all other users in real-time.
 */

import type { Report } from './types';

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// OE Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

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


let oeJobs: OeJob[] = [
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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Films Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

export interface FilmsReport {
    report_date: string;
    gantry_number: string;
    sails_started: Array<{ sail_number: string; comments?: string }>;
    sails_finished: Array<{ sail_number: string; comments?: string }>;
}

let filmsData: FilmsReport[] = [
    {
        report_date: "2023-10-26T12:00:00Z",
        gantry_number: "5",
        sails_started: [],
        sails_finished: [{ sail_number: "OUS2345-141", comments: "Ready for Gantry 5." }],
    },
    {
        report_date: "2023-10-27T10:00:00Z",
        gantry_number: "4",
        sails_started: [{ sail_number: "OIT76541-001", comments: "Started prepping film." }],
        sails_finished: [],
    },
    {
        report_date: "2023-10-25T14:00:00Z",
        gantry_number: "8",
        sails_started: [{ sail_number: "OAUS32145-001" }],
        sails_finished: [{ sail_number: "OAUS32145-001", comments: "All set for Gantry 8." }],
    }
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Gantry Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

export interface GantryReport {
    id: string;
    report_date: string;
    date: string;
    shift: string;
    zone_assignment?: string;
    zoneLeads?: Array<{
        zone_number: string;
        lead_name: string;
    }>;
    personnel?: Array<{
        name: string;
        start_time?: string;
        end_time?: string;
    }>;
    molds?: Array<{
        mold_number: string;
        sails?: Array<{
            sail_number: string;
            stage_of_process?: string;
            issues?: string;
        }>;
        images?: any[];
        downtime_caused?: boolean;
    }>;
    downtime?: Array<{
        reason: string;
        duration: number;
    }>;
    maintenance?: Array<{
        description: string;
        duration: number;
    }>;
}


let gantryReportsData: GantryReport[] = [
    {
        id: "gantry_rpt_new_2",
        report_date: "2023-10-28T12:00:00Z",
        date: "2023-10-28T12:00:00Z",
        shift: "2",
        zone_assignment: "Zone C",
        zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead David" }],
        personnel: [
            { name: "David" },
            { name: "Eve" },
        ],
        molds: [
            {
                mold_number: "Gantry 6 / MOLD 110",
                sails: [
                    { sail_number: "OUS2345-141", stage_of_process: "Lamination Inspection", issues: "Minor cosmetic crease found" },
                ],
                downtime_caused: false,
                images: [],
            },
             {
                mold_number: "Gantry 4 / MOLD 105",
                sails: [
                    { sail_number: "OIT76541-001", stage_of_process: "Grid Base Film Installation", issues: "None" },
                ],
                downtime_caused: false,
                images: [],
            }
        ],
        downtime: [],
        maintenance: [],
    },
    {
        id: "gantry_rpt_new_1",
        report_date: "2023-10-27T12:00:00Z",
        date: "2023-10-27T12:00:00Z",
        shift: "1",
        zone_assignment: "Zone C",
        zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead Charlie" }],
        personnel: [
            { name: "Charlie" },
            { name: "Dana" },
        ],
        molds: [
            {
                mold_number: "Gantry 6 / MOLD 110",
                sails: [
                    { sail_number: "OUS2345-141", stage_of_process: "Lamination", issues: "None" },
                ],
                downtime_caused: false,
                images: [],
            },
        ],
        downtime: [
            { reason: "Planned Maintenance", duration: 60 }
        ],
        maintenance: [],
    },
    {
        id: "gantry_rpt_new_3",
        report_date: "2023-10-26T22:00:00Z",
        date: "2023-10-26T22:00:00Z",
        shift: "3",
        zone_assignment: "Zone B",
        zoneLeads: [{ zone_number: "Zone 2", lead_name: "Lead Frank" }],
        personnel: [
            { name: "Frank" },
            { name: "Grace" },
        ],
        molds: [
            {
                mold_number: "Gantry 8 / MOLD 100",
                sails: [
                    { sail_number: "OAUS32145-001", stage_of_process: "Lamination Inspection", issues: "None" },
                ],
                downtime_caused: true,
            },
        ],
        downtime: [
            { reason: "Vacuum Issues", duration: 30 }
        ],
        maintenance: [
            { description: "Replaced vacuum seal on Gantry 8", duration: 45 }
        ],
    }
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Graphics Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

export interface GraphicsTask {
    id: string;
    type: 'cutting' | 'inking';
    status: 'todo' | 'inProgress' | 'done';
    tagId: string;
    content: string;
    tagType?: 'Sail' | 'Decal';
    sidedness?: 'Single-Sided' | 'Double-Sided';
    sideOfWork?: 'Port' | 'Starboard';
    workTypes?: string[];
    durationMins?: number;
    personnelCount?: number;
    tapeUsed?: boolean;
    isFinished?: boolean;
    startedAt?: string;
    completedAt?: string;
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

let graphicsTasksData: GraphicsTask[] = [
    { 
        id: 'cut-1', type: 'cutting', tagId: 'OUS79723-001', status: 'inProgress', content: 'Main sail body cutting', 
        tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Port', 
        startedAt: today.toISOString(),
        workTypes: ['Cutting', 'Masking']
    },
    { 
        id: 'ink-1', type: 'inking', tagId: 'OUS79723-001', status: 'done', content: 'Applying main logo decal',
        tagType: 'Decal', durationMins: 60, personnelCount: 2, tapeUsed: true, isFinished: true,
        startedAt: today.toISOString(), completedAt: today.toISOString()
    },
    { 
        id: 'cut-2', type: 'cutting', tagId: 'OIT76541-001', status: 'todo', content: 'Jib sail initial cut',
        tagType: 'Sail', sidedness: 'Single-Sided',
        startedAt: today.toISOString()
    },
     { 
        id: 'ink-2', type: 'inking', tagId: 'OIT76541-001', status: 'todo', content: 'Inking Port side insignia',
        tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Port',
        startedAt: today.toISOString()
    },
    { 
        id: 'cut-y1', type: 'cutting', tagId: 'OAUS32145-001', status: 'done', content: 'Full sail cut and weed', 
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 120, personnelCount: 2, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
    { 
        id: 'ink-y1', type: 'inking', tagId: 'OAUS32145-001', status: 'done', content: 'All graphics applied',
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 90, personnelCount: 1, tapeUsed: true, isFinished: false,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
     { 
        id: 'cut-y2', type: 'cutting', tagId: 'DECAL-Y2', status: 'done', content: 'Batch of 50 decals',
        tagType: 'Decal',
        durationMins: 180, personnelCount: 1, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
     },
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Pregger Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

export interface PreggerReport {
    id: string;
    report_date: string;
    shift: string;
    workCompleted: Array<{
        tape_id: string;
        meters: number;
        waste_meters: number;
        material_description: string;
    }>;
    personnel: Array<{
        name: string;
        start_time: string;
        end_time: string;
    }>;
    downtime?: Array<{
        reason: string;
        duration_minutes: number;
    }>;
    briefing_items?: string;
    current_work?: string;
    operational_problems?: string;
    personnel_notes?: string;
    bonding_complete?: boolean;
    epa_report?: boolean;
    end_of_shift_checklist?: boolean;
    images?: any;
}


let preggerReportsData: PreggerReport[] = [
    {
        id: "pregger_rpt_1",
        report_date: "2023-10-27",
        shift: "1",
        workCompleted: [
            { tape_id: "T-101", meters: 2500, waste_meters: 50, material_description: "3Di RAW 760" },
            { tape_id: "T-102", meters: 2300, waste_meters: 45, material_description: "3Di Endurance 780" },
        ],
        personnel: [
            { name: "Operator A", start_time: "06:00", end_time: "14:00" },
            { name: "Operator B", start_time: "06:00", end_time: "14:00" },
        ],
        downtime: [
            { reason: "mechanical", duration_minutes: 45 },
        ],
        bonding_complete: true,
    },
    {
        id: "pregger_rpt_2",
        report_date: "2023-10-27",
        shift: "2",
        workCompleted: [
            { tape_id: "T-103", meters: 3000, waste_meters: 60, material_description: "3Di OCEAN 370" },
        ],
        personnel: [
            { name: "Operator C", start_time: "14:00", end_time: "22:00" },
            { name: "Operator D", start_time: "14:00", end_time: "22:00" },
        ],
        downtime: [
             { reason: "material", duration_minutes: 20 },
        ],
    },
    {
        id: "pregger_rpt_3",
        report_date: "2023-10-26",
        shift: "3",
        workCompleted: [
            { tape_id: "T-101", meters: 2800, waste_meters: 70, material_description: "3Di RAW 760" },
        ],
        personnel: [
            { name: "Operator E", start_time: "22:00", end_time: "06:00" },
        ],
        downtime: [],
    },
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// QC Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

export interface InspectionSubmission {
    id: string;
    inspectionDate: string;
    oeNumber: string;
    inspectorName: string;
    totalScore: number;
    status: 'Pass' | 'Reinspection Required' | 'Fail';
    reinspection?: {
        finalOutcome: string;
        comments: string;
    };
}


let inspectionsData: InspectionSubmission[] = [
    {
        id: 'qc-1',
        inspectionDate: '2023-10-29T12:00:00Z',
        oeNumber: 'OUS2345-141',
        inspectorName: 'Inspector Ali',
        totalScore: 45,
        status: 'Pass',
    },
    {
        id: 'qc-2',
        inspectionDate: '2023-11-01T12:00:00Z',
        oeNumber: 'OIT76541-001',
        inspectorName: 'Inspector Bob',
        totalScore: 75,
        status: 'Reinspection Required',
        reinspection: {
            finalOutcome: 'Recooked',
            comments: 'Minor shrinkage waves were addressed after recooking process. Accepted.'
        }
    },
    {
        id: 'qc-3',
        inspectionDate: '2023-10-27T12:00:00Z',
        oeNumber: 'OAUS32145-001',
        inspectorName: 'Inspector Ali',
        totalScore: 105,
        status: 'Fail',
        reinspection: {
            finalOutcome: 'Rejected',
            comments: 'Major delamination found near clew. Sail is a total loss.'
        }
    }
];

export const defectCategories = [
    {
      id: "lamination",
      title: "Lamination / Automatic Second QC Defects",
      defects: [
        { key: "majorDyneema", label: "Major Dyneema in Tapes" },
        { key: "discoloredPanel", label: "Discolored Panel" },
        { key: "overCooked", label: "Over-Cooked (Melted Dyneema)" },
        { key: "pocketInstallation", label: "Pocket Installation" },
        { key: "cornersNotLaminated", label: "Corners Not Laminated" },
        { key: "noOverlapScarfJoint", label: "No Overlap in Scarf Joint" },
        { key: "majorGlueLine", label: "Major Glue Line" },
        { key: "pocketsShrinkageWaves", label: "Pockets Shrinkage Waves" },
        { key: "majorShrinkageWaves", label: "Major Shrinkage Waves" },
        { key: "tempStickersNotUpToTemp", label: "All Temp Stickers Not Up to Temp" },
        { key: "debris", label: "Debris" },
        { key: "exposedInternal", label: "Exposed Internal" },
        { key: "gapsInExternalTapes", label: "Gaps in External Tapes" },
        { key: "zFold", label: "Z-Fold" },
      ]
    },
    {
      id: "structural",
      title: "Structural Defects",
      defects: [
        { key: "verticalCreases", label: "Vertical Creases" },
        { key: "horizontalCreases", label: "Horizontal Creases" },
        { key: "minorShrinkageWaves", label: "Minor Shrinkage Waves" },
        { key: "bunchedUpInternalTape", label: "Bunched Up Internal Tape" },
      ]
    },
    {
      id: "cosmetic",
      title: "Cosmetic Defects",
      defects: [
        { key: "tintGlueSpots", label: "Tint/Glue Spots" },
        { key: "minorGlueLines", label: "Minor Glue Lines" },
        { key: "dominantDyneema", label: "4 or More Dominant Dyneema" },
        { key: "foldedOverExternalTape", label: "Folded Over External Tape" },
        { key: "fin", label: "Fin" },
        { key: "bunchedUpExternalTape", label: "Bunched Up External Tape" },
        { key: "carbonFrayGlob", label: "Carbon Fray Glob" },
        { key: "tapeSpacing", label: "Tape Spacing" },
        { key: "yarnTwists", label: "4 or More Yarn Twists in 1 Panel" },
        { key: "externalSplices", label: "3 or More External Splices" },
        { key: "foldedWhiteExternal", label: "Folded White External" },
        { key: "badPatch", label: "Bad Patch" },
        { key: "displacedPC", label: "Displaced PC" },
      ]
    }
  ];
  
  export const defectDefinitions = {
    majorDyneema: "A significant concentration or clumping of Dyneema fibers within the sail's tapes, creating a visual and potentially structural irregularity.",
    discoloredPanel: "A panel that exhibits a noticeable and unintended change in color, often due to issues with materials or the lamination process.",
    overCooked: "A state where the sail material, particularly Dyneema, has been subjected to excessive heat during lamination, causing it to melt or deform.",
    pocketInstallation: "An error in the placement, alignment, or bonding of pockets (e.g., for battens or patches) on the sail.",
    cornersNotLaminated: "The corners of the sail (head, tack, clew) are not fully bonded or sealed during the lamination process.",
    noOverlapScarfJoint: "A seam (scarf joint) where two panels meet without the required amount of material overlap, compromising structural integrity.",
    majorGlueLine: "A large, visible, and often thick line of adhesive that has seeped out from a seam or tape edge.",
    pocketsShrinkageWaves: "Distortion or waves appearing around pocket areas, typically caused by uneven material shrinkage during lamination.",
    majorShrinkageWaves: "Significant, widespread waves or puckering across the sail surface resulting from material shrinkage.",
    tempStickersNotUpToTemp: "Temperature-indicating stickers used during lamination fail to show that the required curing temperature was reached.",
    debris: "Foreign particles (dust, hair, insects, etc.) trapped within the layers of the sail during lamination.",
    exposedInternal: "An internal component of the sail, such as a structural tape or patch, is visible on the exterior surface when it should be covered.",
    gapsInExternalTapes: "Visible spaces or gaps between external tapes that should be flush against each other.",
    zFold: "An S-shaped fold or crease in the material that gets laminated into the sail, creating a structural flaw.",
    verticalCreases: "Creases or wrinkles that run parallel to the leech (vertical orientation of the sail).",
    horizontalCreases: "Creases or wrinkles that run parallel to the foot (horizontal orientation of the sail).",
    minorShrinkageWaves: "Slight or localized waves on the sail surface due to material shrinkage, considered less severe than major waves.",
    bunchedUpInternalTape: "An internal structural tape has gathered or bunched up instead of lying flat, creating a lump.",
    tintGlueSpots: "Small, discolored spots on the sail surface caused by excess or improperly applied adhesive in the tinting process.",
    minorGlueLines: "Small, less noticeable lines of adhesive seepage along tape or seam edges.",
    dominantDyneema: "Individual Dyneema yarns that are unusually prominent or visible on the sail surface.",
    foldedOverExternalTape: "An external tape that has been folded over on itself during application, creating a raised edge or line.",
    fin: "A small, sharp protrusion of cured resin or material along a tape edge, resembling a small fin.",
    bunchedUpExternalTape: "An external tape has gathered or bunched up instead of lying flat.",
    carbonFrayGlob: "A clump or ball of frayed carbon fibers that has been laminated into the sail.",
    tapeSpacing: "Inconsistent or incorrect spacing between parallel tapes on the sail.",
    yarnTwists: "A noticeable twist or turn in the structural yarns or fibers within a panel.",
    externalSplices: "The joining or splicing of external tapes. More than the acceptable number is a defect.",
    foldedWhiteExternal: "A white external tape that has been folded over on itself.",
    badPatch: "A repair patch that is poorly applied, misaligned, or visually disruptive.",
    displacedPC: "A 'Print Con' or 'Printed Component' (like a logo or graphic) that is misaligned from its intended position.",
  };

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Tapeheads Data
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

let tapeheadsSubmissions: Report[] = [
    {
        id: "rpt_1_new",
        date: new Date("2023-10-27T12:00:00Z"),
        shift: 1,
        shiftLeadName: "John Doe",
        thNumber: "TH-3",
        operatorName: "Alice",
        shiftStartTime: "06:00",
        shiftEndTime: "14:00",
        status: "Submitted",
        total_meters: 2500,
        workItems: [
            {
                oeNumber: "OUS2345",
                section: "141",
                endOfShiftStatus: "Completed",
                tapes: [
                    { tapeId: "998108", metersProduced: 1500, metersWasted: 20 },
                    { tapeId: "996107", metersProduced: 1000, metersWasted: 10 }
                ],
                total_meters: 2500,
                total_tapes: 2,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"],
            }
        ]
    },
    {
        id: "rpt_2_new",
        date: new Date("2023-10-27T20:00:00Z"),
        shift: 2,
        shiftLeadName: "John Doe",
        thNumber: "TH-5",
        operatorName: "Bob",
        shiftStartTime: "14:00",
        shiftEndTime: "22:00",
        status: "Submitted",
        total_meters: 3100,
        workItems: [
            {
                oeNumber: "OIT76541",
                section: "001",
                endOfShiftStatus: "In Progress",
                layer: "7 of 15",
                tapes: [{ tapeId: "995100", metersProduced: 1800, metersWasted: 50 }],
                total_meters: 1800,
                total_tapes: 1,
                had_spin_out: true,
                spin_out_duration_minutes: 25,
                panelsWorkedOn: ["P1", "P2", "P3"],
            },
            {
                oeNumber: "OIT76541",
                section: "002",
                endOfShiftStatus: "Completed",
                tapes: [{ tapeId: "995127", metersProduced: 1300, metersWasted: 25 }],
                total_meters: 1300,
                total_tapes: 1,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2"],
                issues: [{ problem_reason: 'Machine Jam', duration_minutes: 15 }]
            }
        ]
    },
    {
        id: "rpt_3_new",
        date: new Date("2023-10-26T12:00:00Z"),
        shift: 1,
        shiftLeadName: "Jane Smith",
        thNumber: "TH-3",
        operatorName: "Charlie",
        shiftStartTime: "06:00",
        shiftEndTime: "14:00",
        status: "Approved",
        total_meters: 4500,
        workItems: [
            {
                oeNumber: "OAUS32145",
                section: "001",
                endOfShiftStatus: "Completed",
                tapes: [{ tapeId: "997130", metersProduced: 4500, metersWasted: 100 }],
                total_meters: 4500,
                total_tapes: 1,
                had_spin_out: false,
                panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"],
            }
        ]
    }
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Data Store Object & Functions
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

function addOeJob(job: { oeBase: string, sections: Array<{ sectionId: string, panelStart: number, panelEnd: number }> }) {
  const newJob: OeJob = {
    id: `job-${Date.now()}`,
    oeBase: job.oeBase,
    status: 'pending',
    sections: job.sections.map(s => ({ ...s, completedPanels: [] })),
  };
  oeJobs.unshift(newJob);
}

function getOeSection(oeBase?: string, sectionId?: string): (OeSection & { jobStatus: OeJob['status']}) | undefined {
  if (!oeBase || !sectionId) return undefined;
  const job = oeJobs.find(j => j.oeBase === oeBase);
  if (!job) return undefined;
  
  const section = job.sections.find(s => s.sectionId === sectionId);
  if (!section) return undefined;

  return { ...section, jobStatus: job.status };
}

function markPanelsAsCompleted(oeBase: string, sectionId: string, panels: string[]) {
    const job = oeJobs.find(j => j.oeBase === oeBase);
    if (!job) return;

    const section = job.sections.find(s => s.sectionId === sectionId);
    if (!section) return;

    if (!section.completedPanels) {
        section.completedPanels = [];
    }
    const newPanels = panels.filter(p => !section.completedPanels!.includes(p));
    section.completedPanels.push(...newPanels);

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

export const dataStore = {
    oeJobs,
    filmsData,
    gantryReportsData,
    graphicsTasksData,
    preggerReportsData,
    inspectionsData,
    tapeheadsSubmissions,
    addOeJob,
    getOeSection,
    markPanelsAsCompleted,
};

    