
export interface GraphicsTask {
    id: string;
    type: 'cutting' | 'inking';
    status: 'todo' | 'inProgress' | 'done';
    tagId: string;
    content: string;
    tagType?: 'Sail' | 'Decal';
    sidedness?: 'Single-Sided' | 'Double-Sided';
    sideOfWork?: 'Front' | 'Back';
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

export const graphicsTasksData: GraphicsTask[] = [
    // Today's work
    { 
        id: 'cut-1', type: 'cutting', tagId: 'SAIL-123', status: 'inProgress', content: 'Main sail body cutting', 
        tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Front', 
        startedAt: today.toISOString(),
        workTypes: ['Cutting', 'Masking']
    },
    { 
        id: 'ink-1', type: 'inking', tagId: 'DECAL-456', status: 'done', content: 'Applying main logo decal',
        tagType: 'Decal', durationMins: 60, personnelCount: 2, tapeUsed: true, isFinished: true,
        startedAt: today.toISOString(), completedAt: today.toISOString()
    },
    { 
        id: 'cut-2', type: 'cutting', tagId: 'SAIL-789', status: 'todo', content: 'Jib sail initial cut',
        tagType: 'Sail', sidedness: 'Single-Sided'
    },
     { 
        id: 'ink-2', type: 'inking', tagId: 'SAIL-123', status: 'todo', content: 'Inking front side insignia',
        tagType: 'Sail', sidedness: 'Double-Sided', sideOfWork: 'Front'
    },


    // Yesterday's completed work
    { 
        id: 'cut-y1', type: 'cutting', tagId: 'SAIL-Y1', status: 'done', content: 'Full sail cut and weed', 
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 120, personnelCount: 2, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
    { 
        id: 'ink-y1', type: 'inking', tagId: 'SAIL-Y1', status: 'done', content: 'All graphics applied',
        tagType: 'Sail', sidedness: 'Single-Sided',
        durationMins: 90, personnelCount: 1, tapeUsed: true, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
    },
     { 
        id: 'cut-y2', type: 'cutting', tagId: 'DECAL-Y2', status: 'done', content: 'Batch of 50 decals',
        tagType: 'Decal',
        durationMins: 180, personnelCount: 1, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
     },
     { 
        id: 'ink-y2', type: 'inking', tagId: 'DECAL-Y2', status: 'done', content: 'N/A for decals',
        tagType: 'Decal',
        durationMins: 0, personnelCount: 0, isFinished: true,
        startedAt: yesterday.toISOString(), completedAt: yesterday.toISOString()
     }
];

// Combine with initial tasks for Kanban board display
import { type Task } from '@/components/graphics/graphics-kanban-board';
export const initialTasks: Task[] = [
    { id: 'cut-1', type: 'cutting', tagId: 'SAIL-123', status: 'todo', content: 'Initial cutting task' },
    { id: 'ink-1', type: 'inking', tagId: 'DECAL-456', status: 'inProgress', content: 'Inking main logo' },
    { id: 'cut-2', type: 'cutting', tagId: 'SAIL-789', status: 'done', content: 'Final weeding', durationMins: 45, personnelCount: 1 },
];
