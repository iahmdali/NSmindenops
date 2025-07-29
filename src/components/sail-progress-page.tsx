
"use client";

import React, { useState } from "react";
import { PageHeader } from "./page-header";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { SailVisualization } from "./sail-progress/sail-visualization";
import type { ProgressNode } from "./sail-progress/progress-tree";


// Mock data aggregation
import { tapeheadsSubmissions } from "@/lib/data";
import { graphicsTasksData } from "@/lib/graphics-data";
import { gantryReportsData } from "@/lib/gantry-data";
import { filmsReportsData } from "@/lib/films-data";

const aggregateDataForOE = (oeNumber: string): ProgressNode[] => {
  if (!oeNumber) return [];

  const nodes: ProgressNode[] = [];
  const cleanOeNumber = oeNumber.trim().toLowerCase();
  
  // 1. Gantry Data
  const gantryReportsForOE = gantryReportsData.filter(report =>
    report.molds?.some(mold =>
      mold.sails.some(sail => sail.sail_number.toLowerCase().includes(cleanOeNumber))
    )
  );

  if (gantryReportsForOE.length > 0) {
    nodes.push({
      id: 'gantry',
      name: 'Gantry',
      status: 'Completed', // Simplified status for the department level
      children: gantryReportsForOE.flatMap(report =>
        (report.molds || []).flatMap(mold =>
          mold.sails
            .filter(sail => sail.sail_number.toLowerCase().includes(cleanOeNumber))
            .map(sail => ({
              id: `gantry-${report.id}-${mold.id}-${sail.sail_number}`,
              name: `Mold ${mold.mold_number} - Sail ${sail.sail_number}`,
              status: sail.stage_of_process || 'Unknown Stage',
              details: {
                Date: report.date,
                Shift: report.shift,
                "Recorded Issues": sail.issues || 'None',
              }
            }))
        )
      )
    });
  }
  
  // 2. Films Data
  const filmsReportsForOE = filmsReportsData.filter(report => 
    report.sail_preparations.some(prep => prep.sail_number.toLowerCase().includes(cleanOeNumber))
  );

  if (filmsReportsForOE.length > 0) {
    nodes.push({
      id: 'films',
      name: 'Films',
      status: 'Completed',
      children: filmsReportsForOE.flatMap(report => 
        report.sail_preparations
        .filter(prep => prep.sail_number.toLowerCase().includes(cleanOeNumber))
        .map(prep => ({
          id: `films-${report.report_date}-${prep.sail_number}`,
          name: `Sail Prep for ${prep.sail_number}`,
          status: prep.status_done ? 'Done' : 'In Progress',
          details: {
            Date: report.report_date,
            "Shift Lead": report.shift_lead_name,
            "Gantry/Mold": prep.gantry_mold,
            "Issue Notes": prep.issue_notes || 'None',
          }
        }))
      )
    });
  }

  // 3. Tapeheads data
  const tapeheadsReportsForOE = tapeheadsSubmissions.filter(
    (s) => s.order_entry?.toLowerCase().includes(cleanOeNumber)
  );

  if (tapeheadsReportsForOE.length > 0) {
    nodes.push({
      id: "tapeheads",
      name: "Tapeheads",
      status: "Completed", // Simplified
      children: tapeheadsReportsForOE.map((report) => ({
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

  // 4. Graphics data
  const graphicsTasksForOE = graphicsTasksData.filter(
    (t) => t.tagId.toLowerCase().includes(cleanOeNumber)
  );
  
  if (graphicsTasksForOE.length > 0) {
    const cuttingTasks = graphicsTasksForOE.filter(t => t.type === 'cutting');
    const inkingTasks = graphicsTasksForOE.filter(t => t.type === 'inking');
    
    const children: ProgressNode[] = [];
    if(cuttingTasks.length > 0) {
        children.push({
            id: 'graphics-cutting',
            name: 'Cutting/Masking',
            status: cuttingTasks.every(t => t.status === 'done') ? 'Completed' : 'In Progress',
            children: cuttingTasks.map(task => ({
                id: `graphics-cut-${task.id}`,
                name: task.content || 'Cutting Task',
                status: task.status,
                 details: {
                    Type: task.tagType || 'N/A',
                    Side: task.sideOfWork || 'N/A',
                    Finished: task.isFinished ? 'Yes' : 'No'
                 }
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
                name: task.content || 'Inking Task',
                status: task.status,
                 details: {
                    Type: task.tagType || 'N/A',
                    Side: task.sideOfWork || 'N/A',
                    Finished: task.isFinished ? 'Yes' : 'No'
                 }
            }))
        });
    }

    nodes.push({
      id: "graphics",
      name: "Graphics",
      status: graphicsTasksForOE.every((t) => t.status === "done") ? "Completed" : "In Progress",
      children: children
    });
  }
  
  // Sort nodes for consistent order: Gantry -> Films -> Tapeheads -> Graphics
  nodes.sort((a, b) => {
    const order = ['Gantry', 'Films', 'Tapeheads', 'Graphics'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return nodes;
};


export function SailProgressPage() {
  const [oeNumber, setOeNumber] = useState("OE-12345");
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

  // Automatically run a search for the default OE number on initial load
  React.useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              placeholder="Enter OE Number (e.g., OE-12345)"
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
                <SailVisualization nodes={results} />
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
