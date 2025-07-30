
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "./page-header";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ProgressTree } from "./sail-progress/progress-tree";
import { getSailProgressData, getRecentSails } from "@/lib/sail-progress-logic";
import type { Sail } from "@/lib/sail-progress-types";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Issues Logged": "bg-red-100 text-red-800",
  "QC Passed": "bg-green-100 text-green-800",
  "QC Fail": "bg-red-100 text-red-800",
  "Requires Reinspection": "bg-yellow-100 text-yellow-800"
};

function SailProgressCard({ sail }: { sail: Sail }) {
  const mainSection = sail.sections.find(s => s.isHeadSection);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Sail#: {sail.sailId}</CardTitle>
              <CardDescription>Original OE: {mainSection?.oeNumber || 'N/A'}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Overall Status:</span>
                 <Badge className={cn("text-base", statusColors[sail.overallStatus] || "bg-gray-100 text-gray-800")}>
                    {sail.overallStatus}
                 </Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h4 className="font-semibold mb-2">Sections Included:</h4>
            <div className="flex flex-wrap gap-2">
                {sail.sections.map(section => (
                    <Badge key={section.oeNumber} variant="secondary" className="font-mono">
                        {section.oeNumber}
                    </Badge>
                ))}
            </div>
        </div>
        <div>
            <h4 className="font-semibold mb-4">Department Timeline:</h4>
            <ProgressTree nodes={sail.progress} />
        </div>
      </CardContent>
    </Card>
  )
}

export function SailProgressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedSails, setSearchedSails] = useState<Sail[] | null>(null);
  
  const recentSails = useMemo(() => getRecentSails(10), []);

  const handleSearch = () => {
    if (!searchQuery) {
        setSearchedSails(null); // Clear search results if query is empty
        return;
    };
    setIsLoading(true);
    setSearchedSails(null);
    // Simulate API call
    setTimeout(() => {
      const data = getSailProgressData(searchQuery);
      setSearchedSails(data);
      setIsLoading(false);
    }, 500);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  const displaySails = searchedSails ?? recentSails;
  const displayTitle = searchedSails ? `Search Results for "${searchQuery}"` : "Most Recent Sails";


  return (
    <div className="space-y-8">
      <PageHeader
        title="Sail Progress Tracker"
        description="Search for an Order Entry (OE) number to view complete production status across all departments."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter OE or Sail number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {!isLoading && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">{displayTitle}</h2>
            {displaySails.length > 0 ? (
                displaySails.map(sail => <SailProgressCard key={sail.sailId} sail={sail} />)
            ) : (
                <Alert>
                    <Search className="h-4 w-4" />
                    <AlertTitle>No Results Found</AlertTitle>
                    <AlertDescription>
                        Could not find any production data for the specified query. Please check the number and try again.
                    </AlertDescription>
                </Alert>
            )}
        </div>
      )}
    </div>
  );
}
