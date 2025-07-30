
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

// This is now our single source of truth for task data.
// It will be mutated by the components to simulate a real-time database.
export let graphicsTasksData: GraphicsTask[] = [
    // Today's work
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


    // Yesterday's completed work
    { 
        id: 'cut-y1', type: 'cutting', tagId: 'OAUS32145-001', status: 'done', content: 'Full sail cut and weed', 
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 120, personnelCount: 2, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
    { 
        id: 'ink-y1', type: 'inking', tagId: 'OAUS32145-001', status: 'done', content: 'All graphics applied',
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 90, personnelCount: 1, tapeUsed: true, isFinished: false, // This tag wasn't marked as finished from inking
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
     { 
        id: 'cut-y2', type: 'cutting', tagId: 'DECAL-Y2', status: 'done', content: 'Batch of 50 decals',
        tagType: 'Decal',
        durationMins: 180, personnelCount: 1, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
     },
     // No inking task for DECAL-Y2, so it was ready for shipping after cutting.
];
