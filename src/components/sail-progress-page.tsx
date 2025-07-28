
"use client";

import React, { useState } from "react";
import { PageHeader } from "./page-header";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ProgressTree, type ProgressNode } from "./sail-progress/progress-tree";

// Mock data aggregation
import { tapeheadsSubmissions } from "@/lib/data";
import { graphicsTasksData } from "@/lib/graphics-data";
import { gantryReportsData } from "@/lib/gantry-data";

const aggregateDataForOE = (oeNumber: string): ProgressNode[] => {
  if (!oeNumber) return [];

  const nodes: ProgressNode[] = [];
  const cleanOeNumber = oeNumber.trim().toLowerCase();

  // Find Gantry data by sail number (assuming OE contains a sail number part)
  const gantryReports = gantryReportsData.filter(report =>
    report.molds?.some(mold =>
      mold.sails.some(sail => sail.sail_number.toLowerCase().includes(cleanOeNumber))
    )
  );

  if (gantryReports.length > 0) {
    nodes.push({
      id: 'gantry',
      name: 'Gantry',
      status: 'Completed', // Simplified status
      children: gantryReports.flatMap(report => 
        (report.molds || []).flatMap(mold =>
          mold.sails
            .filter(sail => sail.sail_number.toLowerCase().includes(cleanOeNumber))
            .map(sail => ({
              id: `gantry-${report.id}-${mold.id}-${sail.sail_number}`,
              name: `Mold ${mold.mold_number} - Sail ${sail.sail_number}`,
              status: sail.stage_of_process,
              details: {
                Date: report.date,
                Shift: report.shift,
                Issues: sail.issues || 'None',
              }
            }))
        )
      )
    });
  }

  // Find Tapeheads data
  const tapeheadsReports = tapeheadsSubmissions.filter(
    (s) => s.order_entry?.toLowerCase() === cleanOeNumber
  );

  if (tapeheadsReports.length > 0) {
    nodes.push({
      id: "tapeheads",
      name: "Tapeheads",
      status: "Completed", // Simplified
      children: tapeheadsReports.map((report) => ({
        id: `tapeheads-${report.id}`,
        name: `Operator: ${report.operatorName} on ${report.th_number}`,
        status: report.end_of_shift_status,
        details: {
          Date: new Date(report.date).toLocaleDateString(),
          Shift: report.shift,
          "Total Meters": `${report.total_meters}m`,
          "Spin Out": report.had_spin_out ? "Yes" : "No",
        },
      })),
    });
  }

  // Find Graphics data
  const graphicsTasks = graphicsTasksData.filter(
    (t) => t.tagId.toLowerCase().includes(cleanOeNumber)
  );
  
  if (graphicsTasks.length > 0) {
    const cuttingTasks = graphicsTasks.filter(t => t.type === 'cutting');
    const inkingTasks = graphicsTasks.filter(t => t.type === 'inking');
    
    const children: ProgressNode[] = [];
    if(cuttingTasks.length > 0) {
        children.push({
            id: 'graphics-cutting',
            name: 'Cutting/Masking',
            status: cuttingTasks.every(t => t.status === 'done') ? 'Completed' : 'In Progress',
            children: cuttingTasks.map(task => ({
                id: `graphics-cut-${task.id}`,
                name: task.content,
                status: task.status,
            }))
        });
    }
     if(inkingTasks.length > 0) {
        children.push({
            id: 'graphics-inking',
            name: 'Inking',
            status: inkingTasks.every(t => t.status === 'done') ? 'Completed' : 'In Progress',
             children: inkingTasks.map(task => ({
                id: `graphics-ink-${task.id}`,
                name: task.content,
                status: task.status,
            }))
        });
    }

    nodes.push({
      id: "graphics",
      name: "Graphics",
      status: graphicsTasks.every((t) => t.status === "done") ? "Completed" : "In Progress",
      children: children
    });
  }


  return nodes;
};


export function SailProgressPage() {
  const [oeNumber, setOeNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProgressNode[] | null>(null);

  const handleSearch = () => {
    if (!oeNumber) return;
    setIsLoading(true);
    setResults(null);
    // Simulate API call
    setTimeout(() => {
      const data = aggregateDataForOE(oeNumber);
      setResults(data);
      setIsLoading(false);
    }, 500);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sail Progress Tracker"
        description="Search for an Order Entry (OE) number to see its progress across all departments."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter OE Number (e.g., OE-12345) or Sail Number"
              value={oeNumber}
              onChange={(e) => setOeNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11 text-lg"
            />
            <Button type="submit" size="lg" onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-5 w-5" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center p-12">
            <Wind className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Production Flow for: {oeNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
                <ProgressTree nodes={results} />
            ) : (
                <Alert>
                    <Search className="h-4 w-4" />
                    <AlertTitle>No Results Found</AlertTitle>
                    <AlertDescription>
                        Could not find any production data for the specified OE number. Please check the number and try again.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
