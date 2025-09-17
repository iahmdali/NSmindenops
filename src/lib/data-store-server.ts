
'use server';

import fs from 'fs/promises';
import path from 'path';

// Define paths to the JSON data files
const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
const filePaths = {
    oeJobs: path.join(dataDir, 'oe-jobs.json'),
    filmsData: path.join(dataDir, 'films-data.json'),
    gantryReports: path.join(dataDir, 'gantry-reports.json'),
    graphicsTasks: path.join(dataDir, 'graphics-tasks.json'),
    preggerReports: path.join(dataDir, 'pregger-reports.json'),
    inspections: path.join(dataDir, 'inspections.json'),
    tapeheadsSubmissions: path.join(dataDir, 'tapeheads-submissions.json'),
};

type DataType = keyof typeof filePaths;

// Helper to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Generic function to read data from a JSON file
export async function readData<T>(dataType: DataType): Promise<T> {
    const filePath = filePaths[dataType];
    try {
        if (!(await fileExists(filePath))) {
            // If the file doesn't exist, create it with an empty array
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(filePath, '[]', 'utf-8');
            return [] as T;
        }
        const fileContent = await fs.readFile(filePath, 'utf-8');
        // If file is empty, return empty array
        if (fileContent.trim() === '') {
            return [] as T;
        }
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading data from ${filePath}:`, error);
        return [] as T;
    }
}


// Generic function to write data to a JSON file
export async function writeData(dataType: DataType, data: any): Promise<void> {
    const filePath = filePaths[dataType];
    try {
        await fs.mkdir(dataDir, { recursive: true });
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf-8');
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
    }
}