'use server';
/**
 * @fileOverview A flow for summarizing shift report data.
 *
 * - summarizeShift - A function that generates a summary from operator reports.
 * - SummarizeShiftInput - The input type for the summarizeShift function.
 * - SummarizeShiftOutput - The return type for the summarizeShift function.
 */

import { ai } from '@/ai/genkit';
import type { Report } from '@/lib/types';
import { z } from 'genkit';

const SummarizeShiftInputSchema = z.array(z.any()).describe("An array of operator report objects for a single shift.");
export type SummarizeShiftInput = z.infer<typeof SummarizeShiftInputSchema>;

const SummarizeShiftOutputSchema = z.string().describe("A concise, human-readable summary of the shift's activities.");
export type SummarizeShiftOutput = z.infer<typeof SummarizeShiftOutputSchema>;

function calculateHours(startTimeStr: string, endTimeStr: string): number {
    if (!startTimeStr || !endTimeStr) return 0;
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startH, startM);
    let endDate = new Date(0, 0, 0, endH, endM);
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return parseFloat(diff.toFixed(1));
}

export async function summarizeShift(input: SummarizeShiftInput): Promise<SummarizeShiftOutput> {
    return summarizeShiftFlow(input);
}

const prompt = ai.definePrompt({
    name: 'summarizeShiftPrompt',
    input: { schema: SummarizeShiftInputSchema },
    output: { schema: SummarizeShiftOutputSchema },
    prompt: `You are a shift supervisor summarizing production reports.
Generate a concise "Operational Summary" based on the provided JSON data of operator entries for a single shift.

Your summary should follow this format exactly:
"{number} operators completed shift: {Operator 1 details}; {Operator 2 details}. Total production: {total meters}m across {total hours} total hours."

For each operator, calculate and include:
- Name
- TH-Number (in parentheses)
- Meters produced (e.g., "1200m")
- Hours worked (e.g., "in 8.5h")
- Meters per hour (m/hr), calculated as meters / hours worked, rounded to one decimal place.
- End of shift status (e.g., "Status: In Progress")

Calculate the final totals for:
- Total meters produced (sum of all operator meters)
- Total hours worked (sum of all operator hours)

Here is the data for the shift:
{{{json input}}}
`,
});

const summarizeShiftFlow = ai.defineFlow(
    {
        name: 'summarizeShiftFlow',
        inputSchema: SummarizeShiftInputSchema,
        outputSchema: SummarizeShiftOutputSchema,
    },
    async (input) => {
        // Pre-process data to add derived values like hours worked and m/hr
        const augmentedData = input.map((report: Report) => {
            const hours_worked = calculateHours(report.shift_start_time, report.shift_end_time);
            const meters_per_hour = hours_worked > 0 ? parseFloat((report.total_meters / hours_worked).toFixed(1)) : 0;
            return {
                operator_name: report.operatorName,
                th_number: report.th_number,
                total_meters: report.total_meters,
                hours_worked,
                meters_per_hour,
                end_of_shift_status: report.end_of_shift_status,
            };
        });

        const { output } = await prompt(augmentedData);
        return output!;
    }
);
