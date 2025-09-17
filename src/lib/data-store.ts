
/**
 * @fileoverview This file serves as the single, centralized file-based data store for the application.
 * All data is read from and written to JSON files in the `src/lib/data` directory. This ensures data
 * persistence and that all parts of the application read from and write to the same data source,
 * enabling a multi-user experience where changes are reflected for all users in real-time.
 */
import fs from 'fs';
import path from 'path';
import type { Report } from './types';

// Define paths to the JSON data files
const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const OE_JOBS_PATH = path.join(dataDir, 'oe-jobs.json');
const FILMS_DATA_PATH = path.join(dataDir, 'films-data.json');
const GANTRY_REPORTS_PATH = path.join(dataDir, 'gantry-reports.json');
const GRAPHICS_TASKS_PATH = path.join(dataDir, 'graphics-tasks.json');
const PREGGER_REPORTS_PATH = path.join(dataDir, 'pregger-reports.json');
const INSPECTIONS_PATH = path.join(dataDir, 'inspections.json');
const TAPEHEADS_SUBMISSIONS_PATH = path.join(dataDir, 'tapeheads-submissions.json');


//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Type Definitions
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

export interface FilmsReport {
    report_date: string;
    gantry_number: string;
    sails_started: Array<{ sail_number: string; comments?: string }>;
    sails_finished: Array<{ sail_number: string; comments?: string }>;
}

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


//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// File I/O Functions
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// Generic function to read data from a JSON file
function readData<T>(filePath: string): T {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`Data file not found at ${filePath}, returning empty array.`);
            return [] as T;
        }
        throw error;
    }
}

// Generic function to write data to a JSON file
function writeData(filePath: string, data: any): void {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf-8');
}


//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Data Accessor Class (the new 'dataStore')
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
class DataStore {
    
    get oeJobs(): OeJob[] { return readData<OeJob[]>(OE_JOBS_PATH); }
    get filmsData(): FilmsReport[] { return readData<FilmsReport[]>(FILMS_DATA_PATH); }
    get gantryReportsData(): GantryReport[] { return readData<GantryReport[]>(GANTRY_REPORTS_PATH); }
    get graphicsTasksData(): GraphicsTask[] { return readData<GraphicsTask[]>(GRAPHICS_TASKS_PATH); }
    get preggerReportsData(): PreggerReport[] { return readData<PreggerReport[]>(PREGGER_REPORTS_PATH); }
    get inspectionsData(): InspectionSubmission[] { return readData<InspectionSubmission[]>(INSPECTIONS_PATH); }
    get tapeheadsSubmissions(): Report[] { return readData<Report[]>(TAPEHEADS_SUBMISSIONS_PATH); }
    
    set graphicsTasksData(tasks: GraphicsTask[]) {
        writeData(GRAPHICS_TASKS_PATH, tasks);
    }
    
    set tapeheadsSubmissions(reports: Report[]) {
        writeData(TAPEHEADS_SUBMISSIONS_PATH, reports);
    }
    
    addOeJob(job: { oeBase: string, sections: Array<{ sectionId: string, panelStart: number, panelEnd: number }> }): void {
        const oeJobs = this.oeJobs;
        const newJob: OeJob = {
            id: `job-${Date.now()}`,
            oeBase: job.oeBase,
            status: 'pending',
            sections: job.sections.map(s => ({ ...s, completedPanels: [] })),
        };
        oeJobs.unshift(newJob);
        writeData(OE_JOBS_PATH, oeJobs);
    }

    getOeSection(oeBase?: string, sectionId?: string): (OeSection & { jobStatus: OeJob['status']}) | undefined {
        if (!oeBase || !sectionId) return undefined;
        const job = this.oeJobs.find(j => j.oeBase === oeBase);
        if (!job) return undefined;
        
        const section = job.sections.find(s => s.sectionId === sectionId);
        if (!section) return undefined;

        return { ...section, jobStatus: job.status };
    }

    markPanelsAsCompleted(oeBase: string, sectionId: string, panels: string[]): void {
        const oeJobs = this.oeJobs;
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
        writeData(OE_JOBS_PATH, oeJobs);
    }
    
    addTapeheadsSubmission(report: Report): void {
        const submissions = this.tapeheadsSubmissions;
        submissions.unshift(report);
        writeData(TAPEHEADS_SUBMISSIONS_PATH, submissions);
    }
    
    updateTapeheadsSubmission(updatedReport: Report): void {
        const submissions = this.tapeheadsSubmissions;
        const index = submissions.findIndex(r => r.id === updatedReport.id);
        if (index !== -1) {
            submissions[index] = updatedReport;
            writeData(TAPEHEADS_SUBMISSIONS_PATH, submissions);
        }
    }
    
     deleteTapeheadsSubmission(id: string): void {
        const submissions = this.tapeheadsSubmissions.filter(report => report.id !== id);
        writeData(TAPEHEADS_SUBMISSIONS_PATH, submissions);
    }
}

// Create and export the single instance of the data store
export const dataStore = new DataStore();


//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
//
// Initial Data (for populating files if they don't exist)
//
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

function initializeDataFiles() {
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // --- OE JOBS ---
    if (!fs.existsSync(OE_JOBS_PATH)) {
        const initialOeJobs: OeJob[] = [
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
        writeData(OE_JOBS_PATH, initialOeJobs);
    }
    
    // --- FILMS DATA ---
    if (!fs.existsSync(FILMS_DATA_PATH)) {
        const initialFilmsData: FilmsReport[] = [
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
        writeData(FILMS_DATA_PATH, initialFilmsData);
    }
    
    // --- GANTRY REPORTS ---
    if (!fs.existsSync(GANTRY_REPORTS_PATH)) {
         const initialGantryReports: GantryReport[] = [
            {
                id: "gantry_rpt_new_2",
                report_date: "2023-10-28T12:00:00Z",
                date: "2023-10-28T12:00:00Z",
                shift: "2",
                zone_assignment: "Zone C",
                zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead David" }],
                personnel: [ { name: "David" }, { name: "Eve" } ],
                molds: [
                    {
                        mold_number: "Gantry 6 / MOLD 110",
                        sails: [ { sail_number: "OUS2345-141", stage_of_process: "Lamination Inspection", issues: "Minor cosmetic crease found" } ],
                        downtime_caused: false, images: [],
                    },
                     {
                        mold_number: "Gantry 4 / MOLD 105",
                        sails: [ { sail_number: "OIT76541-001", stage_of_process: "Grid Base Film Installation", issues: "None" } ],
                        downtime_caused: false, images: [],
                    }
                ],
                downtime: [], maintenance: [],
            },
            {
                id: "gantry_rpt_new_1",
                report_date: "2023-10-27T12:00:00Z",
                date: "2023-10-27T12:00:00Z",
                shift: "1",
                zone_assignment: "Zone C",
                zoneLeads: [{ zone_number: "Zone 3", lead_name: "Lead Charlie" }],
                personnel: [ { name: "Charlie" }, { name: "Dana" } ],
                molds: [ { mold_number: "Gantry 6 / MOLD 110", sails: [ { sail_number: "OUS2345-141", stage_of_process: "Lamination", issues: "None" } ], downtime_caused: false, images: [], } ],
                downtime: [ { reason: "Planned Maintenance", duration: 60 } ], maintenance: [],
            },
            {
                id: "gantry_rpt_new_3",
                report_date: "2023-10-26T22:00:00Z",
                date: "2023-10-26T22:00:00Z",
                shift: "3",
                zone_assignment: "Zone B",
                zoneLeads: [{ zone_number: "Zone 2", lead_name: "Lead Frank" }],
                personnel: [ { name: "Frank" }, { name: "Grace" } ],
                molds: [ { mold_number: "Gantry 8 / MOLD 100", sails: [ { sail_number: "OAUS32145-001", stage_of_process: "Lamination Inspection", issues: "None" } ], downtime_caused: true, } ],
                downtime: [ { reason: "Vacuum Issues", duration: 30 } ],
                maintenance: [ { description: "Replaced vacuum seal on Gantry 8", duration: 45 } ],
            }
        ];
        writeData(GANTRY_REPORTS_PATH, initialGantryReports);
    }
    
    // --- GRAPHICS TASKS ---
    if (!fs.existsSync(GRAPHICS_TASKS_PATH)) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const initialGraphicsTasks: GraphicsTask[] = [
             { id: 'cut-1', type: 'cutting', tagId: 'OUS79723-001', status: 'inProgress', content: 'Main sail body cutting', tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Port', startedAt: today.toISOString(), workTypes: ['Cutting', 'Masking'] },
             { id: 'ink-1', type: 'inking', tagId: 'OUS79723-001', status: 'done', content: 'Applying main logo decal', tagType: 'Decal', durationMins: 60, personnelCount: 2, tapeUsed: true, isFinished: true, startedAt: today.toISOString(), completedAt: today.toISOString() },
             { id: 'cut-2', type: 'cutting', tagId: 'OIT76541-001', status: 'todo', content: 'Jib sail initial cut', tagType: 'Sail', sidedness: 'Single-Sided', startedAt: today.toISOString() },
             { id: 'ink-2', type: 'inking', tagId: 'OIT76541-001', status: 'todo', content: 'Inking Port side insignia', tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Port', startedAt: today.toISOString() },
             { id: 'cut-y1', type: 'cutting', tagId: 'OAUS32145-001', status: 'done', content: 'Full sail cut and weed', tagType: 'Sail', sidedness: 'Single-Sided', durationMins: 120, personnelCount: 2, isFinished: true, startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString() },
             { id: 'ink-y1', type: 'inking', tagId: 'OAUS32145-001', status: 'done', content: 'All graphics applied', tagType: 'Sail', sidedness: 'Single-Sided', durationMins: 90, personnelCount: 1, tapeUsed: true, isFinished: false, startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString() },
             { id: 'cut-y2', type: 'cutting', tagId: 'DECAL-Y2', status: 'done', content: 'Batch of 50 decals', tagType: 'Decal', durationMins: 180, personnelCount: 1, isFinished: true, startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString() },
        ];
        writeData(GRAPHICS_TASKS_PATH, initialGraphicsTasks);
    }
    
    // --- PREGGER REPORTS ---
    if (!fs.existsSync(PREGGER_REPORTS_PATH)) {
        const initialPreggerReports: PreggerReport[] = [
            { id: "pregger_rpt_1", report_date: "2023-10-27", shift: "1", workCompleted: [ { tape_id: "T-101", meters: 2500, waste_meters: 50, material_description: "3Di RAW 760" }, { tape_id: "T-102", meters: 2300, waste_meters: 45, material_description: "3Di Endurance 780" }, ], personnel: [ { name: "Operator A", start_time: "06:00", end_time: "14:00" }, { name: "Operator B", start_time: "06:00", end_time: "14:00" }, ], downtime: [ { reason: "mechanical", duration_minutes: 45 }, ], bonding_complete: true, },
            { id: "pregger_rpt_2", report_date: "2023-10-27", shift: "2", workCompleted: [ { tape_id: "T-103", meters: 3000, waste_meters: 60, material_description: "3Di OCEAN 370" }, ], personnel: [ { name: "Operator C", start_time: "14:00", end_time: "22:00" }, { name: "Operator D", start_time: "14:00", end_time: "22:00" }, ], downtime: [ { reason: "material", duration_minutes: 20 }, ], },
            { id: "pregger_rpt_3", report_date: "2023-10-26", shift: "3", workCompleted: [ { tape_id: "T-101", meters: 2800, waste_meters: 70, material_description: "3Di RAW 760" }, ], personnel: [ { name: "Operator E", start_time: "22:00", end_time: "06:00" }, ], downtime: [], },
        ];
        writeData(PREGGER_REPORTS_PATH, initialPreggerReports);
    }

    // --- INSPECTIONS ---
    if (!fs.existsSync(INSPECTIONS_PATH)) {
        const initialInspections: InspectionSubmission[] = [
            { id: 'qc-1', inspectionDate: '2023-10-29T12:00:00Z', oeNumber: 'OUS2345-141', inspectorName: 'Inspector Ali', totalScore: 45, status: 'Pass', },
            { id: 'qc-2', inspectionDate: '2023-11-01T12:00:00Z', oeNumber: 'OIT76541-001', inspectorName: 'Inspector Bob', totalScore: 75, status: 'Reinspection Required', reinspection: { finalOutcome: 'Recooked', comments: 'Minor shrinkage waves were addressed after recooking process. Accepted.' } },
            { id: 'qc-3', inspectionDate: '2023-10-27T12:00:00Z', oeNumber: 'OAUS32145-001', inspectorName: 'Inspector Ali', totalScore: 105, status: 'Fail', reinspection: { finalOutcome: 'Rejected', comments: 'Major delamination found near clew. Sail is a total loss.' } }
        ];
        writeData(INSPECTIONS_PATH, initialInspections);
    }

    // --- TAPEHEADS SUBMISSIONS ---
    if (!fs.existsSync(TAPEHEADS_SUBMISSIONS_PATH)) {
        const initialTapeheadsSubmissions: Report[] = [
            { id: "rpt_1_new", date: new Date("2023-10-27T12:00:00Z"), shift: 1, shiftLeadName: "John Doe", thNumber: "TH-3", operatorName: "Alice", shiftStartTime: "06:00", shiftEndTime: "14:00", status: "Submitted", total_meters: 2500, workItems: [ { oeNumber: "OUS2345", section: "141", endOfShiftStatus: "Completed", tapes: [ { tapeId: "998108", metersProduced: 1500, metersWasted: 20 }, { tapeId: "996107", metersProduced: 1000, metersWasted: 10 } ], total_meters: 2500, total_tapes: 2, had_spin_out: false, panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"], } ] },
            { id: "rpt_2_new", date: new Date("2023-10-27T20:00:00Z"), shift: 2, shiftLeadName: "John Doe", thNumber: "TH-5", operatorName: "Bob", shiftStartTime: "14:00", shiftEndTime: "22:00", status: "Submitted", total_meters: 3100, workItems: [ { oeNumber: "OIT76541", section: "001", endOfShiftStatus: "In Progress", layer: "7 of 15", tapes: [{ tapeId: "995100", metersProduced: 1800, metersWasted: 50 }], total_meters: 1800, total_tapes: 1, had_spin_out: true, spin_out_duration_minutes: 25, panelsWorkedOn: ["P1", "P2", "P3"], }, { oeNumber: "OIT76541", section: "002", endOfShiftStatus: "Completed", tapes: [{ tapeId: "995127", metersProduced: 1300, metersWasted: 25 }], total_meters: 1300, total_tapes: 1, had_spin_out: false, panelsWorkedOn: ["P1", "P2"], issues: [{ problem_reason: 'Machine Jam', duration_minutes: 15 }] } ] },
            { id: "rpt_3_new", date: new Date("2023-10-26T12:00:00Z"), shift: 1, shiftLeadName: "Jane Smith", thNumber: "TH-3", operatorName: "Charlie", shiftStartTime: "06:00", shiftEndTime: "14:00", status: "Approved", total_meters: 4500, workItems: [ { oeNumber: "OAUS32145", section: "001", endOfShiftStatus: "Completed", tapes: [{ tapeId: "997130", metersProduced: 4500, metersWasted: 100 }], total_meters: 4500, total_tapes: 1, had_spin_out: false, panelsWorkedOn: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"], } ] }
        ];
        writeData(TAPEHEADS_SUBMISSIONS_PATH, initialTapeheadsSubmissions);
    }
}

// Run initialization
initializeDataFiles();
