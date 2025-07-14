
export interface GantryReport {
  id: number;
  date: string;
  shift: string;
  zone_assignment: string;
  briefing_items?: string;
  end_of_shift_checklist: boolean;
  zoneLeads?: Array<{
    name: string;
    time: string;
  }>;
  personnel?: Array<{
    name: string;
    start_time: string;
    end_time: string;
  }>;
  molds?: Array<{
    id: number;
    mold_number: string;
    sails: Array<{
      sail_number: string;
      stage_of_process: string;
      issues: string;
    }>;
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

const personnelList = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"];
const zoneLeadsList = ["Lead A", "Lead B", "Lead C"];
const moldNumbers = ["100", "105", "109", "110", "111"];
const stages = ["Layup", "Curing", "Trimming", "Inspection", "Finished"];
const issues = ["Delamination", "Wrinkles", "Contamination", "Porosity", ""];
const downtimeReasons = ["Machine Error", "Material Shortage", "Shift Change", "Lunch", "Planned Maintenance"];

const generateSailNumber = () => {
  const type = Math.random();
  if (type < 0.5) { // Sail
    return `SL-2024-00${Math.floor(Math.random() * 9) + 1}`;
  } else if (type < 0.8) { // Panel
    return `PN-2024-${Math.floor(Math.random() * 5) + 1}00`;
  } else { // Scarf
    return `SC-2024-${Math.floor(Math.random() * 899) + 100}`;
  }
};

const generateRandomData = (days: number): GantryReport[] => {
  const reports: GantryReport[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const reportDate = new Date(today);
    reportDate.setDate(today.getDate() - i);
    const dateStr = reportDate.toISOString().split('T')[0];

    for (let shift = 1; shift <= 3; shift++) {
      if (Math.random() < 0.2) continue; // Skip some shifts

      const reportId = reports.length + 1;
      const numPersonnel = Math.floor(Math.random() * 3) + 2;

      reports.push({
        id: reportId,
        date: dateStr,
        shift: String(shift),
        zone_assignment: `Zone ${String.fromCharCode(65 + (shift-1))}`,
        end_of_shift_checklist: Math.random() > 0.1,
        zoneLeads: [{
            name: zoneLeadsList[shift-1],
            time: "Full Shift"
        }],
        personnel: Array.from({ length: numPersonnel }, (_, p_idx) => ({
            name: personnelList[(i + p_idx) % personnelList.length],
            start_time: shift === 1 ? '06:00' : (shift === 2 ? '14:00' : '22:00'),
            end_time: shift === 1 ? '14:00' : (shift === 2 ? '22:00' : '06:00'),
        })),
        molds: moldNumbers.map((mold_number, m_idx) => ({
            id: reportId * 10 + m_idx,
            mold_number,
            sails: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
                sail_number: generateSailNumber(),
                stage_of_process: stages[Math.floor(Math.random() * stages.length)],
                issues: issues[Math.floor(Math.random() * issues.length)],
            })),
        })),
        downtime: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
            reason: downtimeReasons[Math.floor(Math.random() * downtimeReasons.length)],
            duration: Math.floor(Math.random() * 55) + 5,
        })),
        maintenance: Math.random() > 0.8 ? [{
            description: "Cleaned mold surfaces",
            duration: 30
        }] : [],
      });
    }
  }
  return reports;
};

export const gantryReportsData: GantryReport[] = generateRandomData(30);


    