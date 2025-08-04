
"use client";

import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

interface EnrichedWorkItem extends WorkItem {
  report: Report;
}

export default function TapeheadsStatusPage() {
  const [selectedOe, setSelectedOe] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const availableOes = useMemo(() => {
    const allWorkItems = tapeheadsSubmissions.flatMap(r => r.workItems || []);
    const oeNumbers = allWorkItems.map(item => item.oeNumber);
    return [...new Set(oeNumbers)];
  }, []);

  const sailWorkItems = useMemo(() => {
    if (!selectedOe) return [];

    const items: { [sailKey: string]: EnrichedWorkItem[] } = {};

    tapeheadsSubmissions.forEach(report => {
      report.workItems?.forEach(item => {
        if (item.oeNumber === selectedOe) {
          const sailKey = `${item.oeNumber}-${item.section}`;
          if (!items[sailKey]) {
            items[sailKey] = [];
          }
          items[sailKey].push({ ...item, report });
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

  }, [selectedOe, sortBy, tapeheadsSubmissions]);
  
  // Set the first OE as default if none is selected
  if (!selectedOe && availableOes.length > 0) {
      setSelectedOe(availableOes[0]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tapeheads Sail Status Viewer"
        description="Select an Order Entry number to see the status of all its associated sails."
      >
        <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedOe} value={selectedOe || ''}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an OE..." />
              </SelectTrigger>
              <SelectContent>
                {availableOes.map(oe => (
                  <SelectItem key={oe} value={oe}>{oe}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <p className="text-muted-foreground">Please select an OE number to view sail statuses.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
