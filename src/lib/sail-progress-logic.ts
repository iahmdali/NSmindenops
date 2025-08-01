
import { tapeheadsSubmissions } from '@/lib/tapeheads-data';
import { gantryReportsData } from '@/lib/gantry-data';
import { filmsData } from '@/lib/films-data';
import type { Sail, SailProgress, DepartmentProgress, OrderEntry } from './sail-progress-types';

function getSailBaseAndGroup(oeNumber: string): { base: string; group: string; sailNumPrefix: string } | null {
    const match = oeNumber.match(/^([A-Z]{2,3}[0-9]+)-([0-9]{3})$/);
    if (!match) return null;
    const base = match[1];
    const suffix = match[2];
    const group = suffix.slice(-1);
    const sailNumPrefix = suffix.slice(0,1);
    return { base, group, sailNumPrefix };
}

function getSailIdentifier(oeNumber: string): string | null {
    const info = getSailBaseAndGroup(oeNumber);
    if (!info) return null;
    return `${info.base}-sail${info.sailNumPrefix}-group${info.group}`;
}


function addTapeheadsData(progress: DepartmentProgress[], allOeNumbers: string[]) {
    const reports = tapeheadsSubmissions.filter(r => allOeNumbers.includes(r.order_entry || ''));
    if (reports.length === 0) return;

    const totalMeters = reports.reduce((acc, r) => acc + r.total_meters, 0);
    const totalTapes = reports.reduce((acc, r) => acc + r.total_tapes, 0);
    const operators = [...new Set(reports.map(r => r.operatorName))].join(', ');
    const spinOuts = reports.filter(r => r.had_spin_out).length;

    progress.push({
        id: 'tapeheads',
        name: 'Tapeheads',
        status: reports.some(r => r.end_of_shift_status !== 'Completed') ? 'In Progress' : 'Completed',
        details: [
            { label: 'Operators', value: operators },
            { label: 'Total Meters', value: `${totalMeters}m` },
            { label: 'Total Tapes', value: totalTapes },
            { label: 'Spin-Outs', value: spinOuts },
        ],
        reports: reports
    });
}

function addGantryData(progress: DepartmentProgress[], allOeNumbers: string[]) {
    const reports = gantryReportsData.filter(report => 
        report.molds?.some(mold => 
            mold.sails?.some(sail => allOeNumbers.includes(sail.sail_number))
        )
    );
    if (reports.length === 0) return;

    const allSails = reports.flatMap(r => {
        const reportDate = r.date;
        return (r.molds || []).flatMap(m => 
            (m.sails || [])
                .filter(s => allOeNumbers.includes(s.sail_number))
                .map(sail => ({ ...sail, reportDate: reportDate, moldNumber: m.mold_number }))
        );
    });

    progress.push({
        id: 'gantry',
        name: 'Gantry',
        status: 'In Progress', 
        details: allSails.map(s => ({ label: `Sail ${s.sail_number}`, value: `on Mold ${s.moldNumber} - ${s.stage_of_process}` })),
        reports: allSails
    });
}

function addFilmsData(progress: DepartmentProgress[], allOeNumbers: string[]) {
    const started = filmsData.filter(r => r.sails_started?.some(s => allOeNumbers.includes(s.sail_number)));
    const finished = filmsData.filter(r => r.sails_finished?.some(s => allOeNumbers.includes(s.sail_number)));
    
    if (started.length === 0 && finished.length === 0) return;

    let status: DepartmentProgress['status'] = 'Pending';
    if(started.length > 0) status = 'In Progress';
    if(finished.length > 0) status = 'Completed';

    const details = [];
    if (started.length > 0) {
        details.push({ label: 'Started On', value: started.map(r => new Date(r.report_date).toLocaleDateString()).join(', ') });
    }
     if (finished.length > 0) {
        details.push({ label: 'Finished On', value: finished.map(r => new Date(r.report_date).toLocaleDateString()).join(', ') });
    }

    progress.push({
        id: 'films',
        name: 'Films',
        status: status,
        details: details,
        reports: [...started, ...finished]
    });
}


function addQcData(progress: DepartmentProgress[], allOeNumbers: string[]) {
    // This function is now empty as QC data is removed.
}

export function aggregateDataForSail(sail: Sail): SailProgress {
    const progress: DepartmentProgress[] = [];
    const allOeNumbers = sail.sections.map(s => s.oe_number);

    addTapeheadsData(progress, allOeNumbers);
    addGantryData(progress, allOeNumbers);
    addFilmsData(progress, allOeNumbers);
    addQcData(progress, allOeNumbers);
    
    // Determine overall status
    const statuses = progress.map(p => p.status);
    let overallStatus: SailProgress['overallStatus'] = 'Pending';
    if (statuses.every(s => s === 'Completed')) {
        overallStatus = 'Completed';
    } else if (statuses.some(s => s === 'Issues Logged')) {
        overallStatus = 'Issues Logged';
    } else if (statuses.some(s => s === 'In Progress' || s === 'Completed')) {
        overallStatus = 'In Progress';
    }
    
    return {
        ...sail,
        progress,
        overallStatus
    };
}


function getAllOrderEntries(): OrderEntry[] {
    const oeNumbers = new Set<string>();

    tapeheadsSubmissions.forEach(r => r.order_entry && oeNumbers.add(r.order_entry));
    gantryReportsData.forEach(r => r.molds?.forEach(m => m.sails?.forEach(s => s.sail_number && oeNumbers.add(s.sail_number))));
    filmsData.forEach(r => {
        r.sails_started?.forEach(s => s.sail_number && oeNumbers.add(s.sail_number));
        r.sails_finished?.forEach(s => s.sail_number && oeNumbers.add(s.sail_number));
    });

    return Array.from(oeNumbers).map(oe => {
        const parts = getSailBaseAndGroup(oe);
        return {
            oe_number: oe,
            base: parts?.base || '',
            group: parts?.group || '',
            sailIdentifier: getSailIdentifier(oe) || '',
            date: findDateForOe(oe) 
        };
    }).filter(oe => oe.sailIdentifier);
}

function findDateForOe(oeNumber: string): Date {
    const tapeheadsReport = tapeheadsSubmissions.find(r => r.order_entry === oeNumber);
    if(tapeheadsReport) return new Date(tapeheadsReport.date);

    const gantryReport = gantryReportsData.find(r => r.molds?.some(m => m.sails?.some(s => s.sail_number === oeNumber)));
    if(gantryReport) return new Date(gantryReport.date);

    const filmsReport = filmsData.find(r => r.sails_started?.some(s => s.sail_number === oeNumber) || r.sails_finished?.some(s => s.sail_number === oeNumber));
    if(filmsReport) return new Date(filmsReport.report_date);
    
    return new Date();
}

function groupEntriesIntoSails(allEntries: OrderEntry[]): Sail[] {
    const sailsById = new Map<string, Sail>();

    allEntries.forEach(entry => {
        if (!sailsById.has(entry.sailIdentifier)) {
            const sailPrefixMatch = entry.oe_number.match(/^([A-Z]{2,3}[0-9]+)/);
            const sailPrefix = sailPrefixMatch ? sailPrefixMatch[1] : "UNKNOWN";

            sailsById.set(entry.sailIdentifier, {
                id: entry.sailIdentifier,
                sailNumber: `${sailPrefix}-...-${entry.group}`,
                originalOe: entry.oe_number,
                base: entry.base,
                group: entry.group,
                sections: [],
                lastUpdated: new Date(0)
            });
        }

        const sail = sailsById.get(entry.sailIdentifier)!;
        sail.sections.push(entry);
        if (entry.date > sail.lastUpdated) {
            sail.lastUpdated = entry.date;
        }
    });

    return Array.from(sailsById.values());
}


export function getRecentSails(count: number): SailProgress[] {
    const allEntries = getAllOrderEntries();
    const allSails = groupEntriesIntoSails(allEntries);

    allSails.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
    
    const recentSails = allSails.slice(0, count);

    return recentSails.map(aggregateDataForSail);
}

export function searchSails(query: string): SailProgress[] {
    if (!query) return getRecentSails(10);
    
    const lowerQuery = query.toLowerCase();
    const allEntries = getAllOrderEntries();
    
    const matchingSails = new Set<string>();

    allEntries.forEach(entry => {
        if(entry.oe_number.toLowerCase().includes(lowerQuery) || entry.base.toLowerCase().includes(lowerQuery)) {
            matchingSails.add(entry.sailIdentifier);
        }
    });

    const sailsToProcess = groupEntriesIntoSails(allEntries.filter(e => matchingSails.has(e.sailIdentifier)));
    return sailsToProcess.map(aggregateDataForSail);
}
