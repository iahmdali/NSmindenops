
export interface OrderEntry {
    oe_number: string;
    base: string;
    group: string;
    sailIdentifier: string;
    date: Date;
}

export interface Sail {
    id: string; // e.g., OAUS12345-sail1-group1
    sailNumber: string; // e.g., OAUS12345-...-1
    originalOe: string;
    base: string;
    group: string;
    sections: OrderEntry[];
    lastUpdated: Date;
}

export interface DepartmentProgress {
    id: string;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Issues Logged';
    details: Array<{
        label: string;
        value: string | number;
    }>;
    reports?: any[];
}

export interface SailProgress extends Sail {
    progress: DepartmentProgress[];
    overallStatus: 'Pending' | 'In Progress' | 'Completed' | 'Issues Logged';
}
