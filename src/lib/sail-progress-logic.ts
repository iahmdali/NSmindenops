
import type { Sail, ProgressNode, Section } from './sail-progress-types';
import { tapeheadsSubmissions } from "@/lib/data";
import { graphicsTasksData } from "@/lib/graphics-data";
import { gantryReportsData } from "@/lib/gantry-data";
import { filmsReportsData } from "@/lib/films-data";
import { qcInspectionData } from "@/lib/qc-data";

/**
 * Parses an OE number to extract its base and suffix.
 * Example: 'OUS79723-001' -> { base: 'OUS79723', suffix: '001' }
 */
function parseOeNumber(oeNumber: string): { base: string, suffix: string } | null {
    const match = oeNumber.match(/^([A-Z0-9]+)-(\d{3,})$/i);
    if (!match) return null;
    return { base: match[1], suffix: match[2] };
}

/**
 * Finds all related OE section numbers for a given sail base.
 */
function findRelatedOeNumbers(sailBase: string): string[] {
    const allOes = new Set<string>();
    
    // Simple way to get all possible OEs from mock data
    tapeheadsSubmissions.forEach(s => s.order_entry && allOes.add(s.order_entry));
    gantryReportsData.forEach(r => r.molds?.forEach(m => m.sails.forEach(s => allOes.add(s.sail_number))));
    filmsReportsData.forEach(r => r.sail_preparations.forEach(p => allOes.add(p.sail_number)));
    qcInspectionData.forEach(qc => allOes.add(qc.oe_number));
    graphicsTasksData.forEach(t => allOes.add(t.tagId));
    
    const relatedOes: string[] = [];
    allOes.forEach(oe => {
        const parsed = parseOeNumber(oe);
        if (parsed && parsed.base.toLowerCase() === sailBase.toLowerCase()) {
            relatedOes.push(oe);
        }
    });

    return [...new Set(relatedOes)]; // Return unique values
}

/**
 * Aggregates all production data for a given sail.
 */
function aggregateDataForSail(sailId: string, allOeNumbers: string[]): Sail {
    const progress: ProgressNode[] = [];
    const sections: Section[] = allOeNumbers.map(oe => {
        const parsed = parseOeNumber(oe);
        const suffix = parsed?.suffix || '';
        return {
            oeNumber: oe,
            isHeadSection: suffix.startsWith('00'),
            suffix,
        };
    }).sort((a,b) => a.suffix.localeCompare(b.suffix));

    // Department-specific logic
    addTapeheadsData(progress, allOeNumbers);
    addFilmsData(progress, allOeNumbers);
    addGantryData(progress, allOeNumbers);
    addGraphicsData(progress, allOeNumbers);
    addQcData(progress, allOeNumbers);

    // Determine overall status
    const allCompleted = progress.every(p => p.status.startsWith('Completed') || p.status.startsWith('QC Passed'));
    const hasIssues = progress.some(p => p.status.includes('Issues') || p.status.includes('Fail'));
    let overallStatus = "In Progress";
    if (allCompleted && !hasIssues) {
        overallStatus = "Completed";
    } else if (hasIssues) {
        overallStatus = "Issues Logged";
    }

    return {
        sailId,
        sections,
        progress: progress.sort((a, b) => {
            const order = ['Tapeheads', 'Films', 'Gantry', 'Graphics', 'QC'];
            return order.indexOf(a.name) - order.indexOf(b.name);
        }),
        overallStatus
    };
}

// --- Department Specific Data Aggregators ---

function addTapeheadsData(progress: ProgressNode[], allOeNumbers: string[]) {
    const reports = tapeheadsSubmissions.filter(s => s.order_entry && allOeNumbers.map(o => o.toLowerCase()).includes(s.order_entry.toLowerCase()));
    if (reports.length === 0) return;

    progress.push({
        id: 'tapeheads',
        name: 'Tapeheads',
        status: reports.every(r => r.end_of_shift_status === 'Completed') ? "Completed" : "In Progress",
        children: reports.map(r => ({
            id: `tapeheads-${r.id}`,
            name: `Operator: ${r.operatorName} on ${r.th_number}`,
            status: r.end_of_shift_status,
            details: {
                Date: new Date(r.date).toLocaleDateString(),
                "Total Meters": `${r.total_meters}m`,
                "Spin Out": r.had_spin_out ? "Yes" : "No",
            }
        }))
    });
}

function addFilmsData(progress: ProgressNode[], allOeNumbers: string[]) {
    const reports = filmsReportsData.filter(r => r.sail_preparations.some(p => allOeNumbers.map(o => o.toLowerCase()).includes(p.sail_number.toLowerCase())));
    if (reports.length === 0) return;
    
    const allPreps = reports.flatMap(r => r.sail_preparations.filter(p => allOeNumbers.map(o => o.toLowerCase()).includes(p.sail_number.toLowerCase())));

    progress.push({
        id: 'films',
        name: 'Films',
        status: allPreps.every(p => p.status_done) ? "Completed" : "In Progress",
        children: allPreps.map(p => ({
            id: `films-${p.sail_number}-${p.prep_date}`,
            name: `Prep for ${p.sail_number}`,
            status: p.status_done ? 'Prepped' : 'In Progress',
            details: {
                Date: new Date(p.prep_date).toLocaleDateString(),
                "Gantry/Mold": p.gantry_mold,
                "Issues": p.issue_notes || 'None',
            }
        }))
    });
}

function addGantryData(progress: ProgressNode[], allOeNumbers: string[]) {
    const reports = gantryReportsData.filter(r => r.molds?.some(m => m.sails.some(s => allOeNumbers.map(o => o.toLowerCase()).includes(s.sail_number.toLowerCase()))));
    if (reports.length === 0) return;

    const allSails = reports.flatMap(r => r.molds || []).flatMap(m => m.sails.filter(s => allOeNumbers.map(o => o.toLowerCase()).includes(s.sail_number.toLowerCase())).map(sail => ({ ...sail, reportDate: r.date, moldNumber: m.mold_number })));

    progress.push({
        id: 'gantry',
        name: 'Gantry',
        status: allSails.every(s => s.stage_of_process === 'Finished') ? "Completed" : "In Progress",
        children: allSails.map(s => ({
            id: `gantry-${s.sail_number}-${s.reportDate}`,
            name: `Gantry work for ${s.sail_number}`,
            status: s.stage_of_process,
            details: {
                Date: new Date(s.reportDate).toLocaleDateString(),
                "Mold": s.moldNumber,
                "Issues": s.issues || 'None',
            }
        }))
    });
}

function addGraphicsData(progress: ProgressNode[], allOeNumbers: string[]) {
     const tasks = graphicsTasksData.filter(t => allOeNumbers.map(o => o.toLowerCase()).includes(t.tagId.toLowerCase()));
     if (tasks.length === 0) return;

     progress.push({
         id: 'graphics',
         name: 'Graphics',
         status: tasks.every(t => t.status === 'done') ? "Completed" : "In Progress",
         children: tasks.map(t => ({
             id: `graphics-${t.id}`,
             name: `${t.type === 'cutting' ? 'Cutting' : 'Inking'} for ${t.tagId}`,
             status: t.status,
             details: {
                Type: t.tagType || 'N/A',
                Side: t.sideOfWork || 'N/A',
                Finished: t.isFinished ? 'Yes' : 'No'
             }
         }))
     });
}

function addQcData(progress: ProgressNode[], allOeNumbers: string[]) {
    const reports = qcInspectionData.filter(qc => allOeNumbers.map(o => o.toLowerCase()).includes(qc.oe_number.toLowerCase()));
    if (reports.length === 0) return;

    const getStatus = (score: number) => {
        if (score >= 100) return "QC Fail";
        if (score >= 61) return "Requires Reinspection";
        return "QC Passed";
    }

    progress.push({
        id: 'qc',
        name: 'QC',
        status: getStatus(reports[0].totalScore), // Assuming one QC report per sail for now
        children: reports.map(r => ({
            id: `qc-${r.oe_number}`,
            name: `Inspection for ${r.oe_number}`,
            status: getStatus(r.totalScore),
            details: {
                Date: new Date(r.inspection_date).toLocaleDateString(),
                Inspector: r.inspector_name,
                Score: r.totalScore,
                Decision: r.reinspection_notes || 'N/A'
            }
        }))
    });
}


/**
 * Main function to get progress data for a given search query.
 */
export function getSailProgressData(query: string): Sail[] {
    const parsed = parseOeNumber(query);
    if (!parsed) return [];

    const sailBase = parsed.base;
    const allOeNumbersForSail = findRelatedOeNumbers(sailBase);

    if (allOeNumbersForSail.length === 0) return [];

    const sailId = sailBase + '-' + allOeNumbersForSail[0].split('-')[1].slice(0, -1) + 'X';

    return [aggregateDataForSail(sailId, allOeNumbersForSail)];
}

/**
 * Gets a list of the most recent sails.
 */
export function getRecentSails(count: number): Sail[] {
    const allSailBases = new Set<string>();
    qcInspectionData.forEach(qc => {
        const parsed = parseOeNumber(qc.oe_number);
        if(parsed) allSailBases.add(parsed.base);
    });

    const recentSails: Sail[] = [];
    Array.from(allSailBases).slice(0, count).forEach(base => {
        const sailData = getSailProgressData(base + "-001"); // Search with a dummy head section
        if (sailData.length > 0) {
            recentSails.push(sailData[0]);
        }
    });

    return recentSails;
}
