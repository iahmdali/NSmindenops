
'use server';

import fs from 'fs/promises';
import path from 'path';

// Define paths to the JSON data files
const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
export const OE_JOBS_PATH = path.join(dataDir, 'oe-jobs.json');
export const FILMS_DATA_PATH = path.join(dataDir, 'films-data.json');
export const GANTRY_REPORTS_PATH = path.join(dataDir, 'gantry-reports.json');
export const GRAPHICS_TASKS_PATH = path.join(dataDir, 'graphics-tasks.json');
export const PREGGER_REPORTS_PATH = path.join(dataDir, 'pregger-reports.json');
export const INSPECTIONS_PATH = path.join(dataDir, 'inspections.json');
export const TAPEHEADS_SUBMISSIONS_PATH = path.join(dataDir, 'tapeheads-submissions.json');

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
export async function readData<T>(filePath: string): Promise<T> {
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
export async function writeData(filePath: string, data: any): Promise<void> {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf-8');
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
    }
}


// Specific read functions
export const readOeJobs = () => readData<any[]>(OE_JOBS_PATH);
export const readGraphicsTasks = () => readData<any[]>(GRAPHICS_TASKS_PATH);
export const readTapeheadsSubmissions = () => readData<any[]>(TAPEHEADS_SUBMISSIONS_PATH);

// Specific write functions
export const writeOeJobs = async (data: any) => await writeData(OE_JOBS_PATH, data);
export const writeGraphicsTasks = async (data: any) => await writeData(GRAPHICS_TASKS_PATH, data);
export const writeTapeheadsSubmissions = async (data: any) => await writeData(TAPEHEADS_SUBMISSIONS_PATH, data);
