
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


export const defectCategories = [
    {
        id: 'lamination',
        title: 'Lamination Defects (Go/No-Go)',
        defects: [
            { key: 'tape Wrinkles', label: 'Tape Wrinkles' },
            { key: 'filmWrinkles', label: 'Film Wrinkles' },
            { key: 'pocketInstallation', label: 'Pocket Installation Defect' },
            { key: 'noOverlapScarfJoint', label: 'No Overlap on Scarf Joint' },
            { key: 'tapeNotStuck', label: 'Tape Not Stuck to Film' },
        ],
    },
    {
        id: 'structural',
        title: 'Structural Defects (Severity 0-10)',
        defects: [
            { key: 'bridging', label: 'Bridging' },
            { key: 'cornerWrinkles', label: 'Corner Wrinkles' },
            { key: 'looseFibers', label: 'Loose Fibers' },
            { key: 'tapeAlignment', label: 'Tape Alignment' },
            { key: 'tapeSplice', label: 'Tape Splice' },
            { key: 'tapeWidth', label: 'Tape Width' },
            { key: 'scrimAndGlue', label: 'Scrim and Glue' },
            { key: 'tapeNotCentered', label: 'Tape Not Centered' },
        ],
    },
    {
        id: 'cosmetic',
        title: 'Cosmetic Defects (Severity 0-10)',
        defects: [
            { key: 'bubbles', label: 'Bubbles' },
            { key: 'debris', label: 'Debris' },
            { key: 'glueStains', label: 'Glue Stains' },
            { key: 'scratches', label: 'Scratches' },
            { key: 'shrinkageWaves', label: 'Shrinkage Waves' },
            { key: 'siliconeStains', label: 'Silicone Stains' },
            { key: 'tapeNotTrimmed', label: 'Tape Not Trimmed to Edge' },
            { key: 'unevenCorner', label: 'Uneven Corner' },
        ],
    },
];

export const defectDefinitions = {
    tapeWrinkles: 'Wrinkles or creases found on the tapes themselves.',
    filmWrinkles: 'Wrinkles or creases found on the film.',
    pocketInstallation: 'Incorrect installation of any sail pockets.',
    noOverlapScarfJoint: 'Scarf joints that do not have the required overlap.',
    tapeNotStuck: 'Any instance where tape is not properly adhered to the film.',
    bridging: 'Tapes lifting or bridging over a contour.',
    cornerWrinkles: 'Wrinkles specifically originating from or located in the corners.',
    looseFibers: 'Any loose or stray fibers visible.',
    tapeAlignment: 'Misalignment of tapes relative to their intended path.',
    tapeSplice: 'Issues with tape splices, such as gaps or excessive overlap.',
    tapeWidth: 'Tape not conforming to the specified width.',
    scrimAndGlue: 'Visible issues with the scrim layer or glue application.',
    tapeNotCentered: 'Tape is not centered on its path.',
    bubbles: 'Air bubbles trapped under film or tapes.',
    debris: 'Any foreign material trapped in the sail.',
    glueStains: 'Visible stains from glue.',
    scratches: 'Scratches on the surface of the film.',
    shrinkageWaves: 'Waves or ripples in the film due to shrinkage.',
    siliconeStains: 'Visible stains from silicone.',
    tapeNotTrimmed: 'Tape not trimmed cleanly to the edge of the sail.',
    unevenCorner: 'Corners that are not shaped or finished evenly.',
};
