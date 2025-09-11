
"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { tapeheadsSubmissions } from '@/lib/tapeheads-data';
import type { Report, WorkItem } from '@/lib/types';
import { SailStatusCard } from '@/components/status/sail-status-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { filmsData } from '@/lib/films-data';
import { gantryReportsData } from '@/lib/gantry-data';
import { inspectionsData, type InspectionSubmission } from '@/lib/qc-data';

interface FilmsInfo {
    status: 'Prepped' | 'In Progress' | 'No Entry';
    workDate?: string;
    gantry?: string;
    notes?: string;
}

interface GantryInfo {
    moldNumber: string;
    stage: string;
    issues?: string;
    downtimeCaused?: boolean;
    date: string;
    images?: any[];
}

interface EnrichedWorkItem extends WorkItem {
  report: Report;
  filmsInfo: FilmsInfo;
  gantryHistory: GantryInfo[];
  qcInspection?: InspectionSubmission;
}

export default function TapeheadsStatusPage() {
  const [selectedOe, setSelectedOe] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  // Set the most recent OE as default on initial load
  useEffect(() => {
    if (tapeheadsSubmissions.length > 0) {
      const mostRecentReport = [...tapeheadsSubmissions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const defaultOe = mostRecentReport.workItems?.[0]?.oeNumber;
      if (defaultOe) {
        setSelectedOe(defaultOe);
        setSearchTerm(defaultOe);
      }
    }
  }, []);

  const sailWorkItems = useMemo(() => {
    if (!selectedOe) return [];

    const items: { [sailKey: string]: EnrichedWorkItem[] } = {};

    tapeheadsSubmissions.forEach(report => {
      report.workItems?.forEach(item => {
        if (item.oeNumber === selectedOe) {
          const sailKey = `${item.oeNumber}-${item.section}`;
          const sailNumber = sailKey;
          
          // --- Find Films Department Info ---
          let filmsInfo: FilmsInfo = { status: 'No Entry' };
          const finishedReport = filmsData.find(fr => fr.sails_finished.some(s => s.sail_number === sailNumber));
          const startedReport = filmsData.find(fr => fr.sails_started.some(s => s.sail_number === sailNumber));

          if (finishedReport) {
              const finishedSail = finishedReport.sails_finished.find(s => s.sail_number === sailNumber);
              filmsInfo = {
                  status: 'Prepped',
                  workDate: finishedReport.report_date,
                  gantry: finishedReport.gantry_number,
                  notes: finishedSail?.comments,
              };
          } else if (startedReport) {
              filmsInfo = {
                  status: 'In Progress',
                  workDate: startedReport.report_date,
                  gantry: startedReport.gantry_number,
              };
          }
          // --- End of Films Logic ---

          // --- Find Gantry Department Info ---
          const gantryHistory: GantryInfo[] = [];
          gantryReportsData.forEach(gantryReport => {
              gantryReport.molds?.forEach(mold => {
                  mold.sails?.forEach(sail => {
                      if (sail.sail_number === sailNumber) {
                          gantryHistory.push({
                              moldNumber: mold.mold_number,
                              stage: sail.stage_of_process || 'N/A',
                              issues: sail.issues,
                              downtimeCaused: mold.downtime_caused,
                              date: gantryReport.date,
                              images: mold.images,
                          });
                      }
                  });
              });
          });
           // Sort history by most recent date
          gantryHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          // --- End of Gantry Logic ---

          // --- Find QC Inspection Info ---
          const qcInspection = inspectionsData.find(qc => qc.oeNumber === sailNumber);
          // --- End of QC Logic ---
          
          if (!items[sailKey]) {
            items[sailKey] = [];
          }
          items[sailKey].push({ ...item, report, filmsInfo, gantryHistory, qcInspection });
        }
      });
    });

    // For each sail, we only want the most recent update.
    const latestWorkItems = Object.values(items).map(workLog => {
        // Find the most recent report for this specific sail
        return workLog.reduce((latest, current) => {
            return new Date(current.report.date) > new Date(latest.report.date) ? current : latest;
        });
    });

    // Sorting logic
    latestWorkItems.sort((a, b) => {
      if (sortBy === 'status') {
        if (a.endOfShiftStatus === b.endOfShiftStatus) {
            return new Date(b.report.date).getTime() - new Date(a.report.date).getTime();
        }
        return a.endOfShiftStatus === 'Completed' ? 1 : -1;
      }
      // Default to sorting by date
      return new Date(b.report.date).getTime() - new Date(a.report.date).getTime();
    });

    return latestWorkItems;

  }, [selectedOe, sortBy]);
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setSelectedOe(searchTerm);
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Sail Status Viewer"
        description="Enter an Order Entry number to see the status of all its associated sails."
      >
        <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by OE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
            </form>
            <Select onValueChange={(value) => setSortBy(value as 'date' | 'status')} value={sortBy}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </PageHeader>

      {selectedOe ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sailWorkItems.length > 0 ? (
                sailWorkItems.map((item, index) => (
                    <SailStatusCard key={`${item.oeNumber}-${item.section}-${index}`} item={item} />
                ))
            ) : (
                <Card className="md:col-span-2 xl:col-span-3">
                    <CardContent className="p-10 text-center">
                        <p className="text-muted-foreground">No Tapeheads work recorded for OE# {selectedOe}.</p>
                    </CardContent>
                </Card>
            )}
         </div>
      ) : (
        <Card>
            <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">Please enter an OE number and press Enter to view sail statuses.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
