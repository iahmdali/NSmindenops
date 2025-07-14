"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from "recharts"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

const productionChartConfig = {
  meters: {
    label: "Meters",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const downtimeChartConfig = {
  Pregger: { label: 'Pregger', color: "hsl(var(--chart-1))" },
  Tapeheads: { label: 'Tapeheads', color: "hsl(var(--chart-2))" },
  Gantry: { label: 'Gantry', color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const issuesData = [
    { department: "Tapeheads", issue: "Machine B Jam", occurrences: 5, status: "Ongoing" },
    { department: "Gantry", issue: "Material Shortage", occurrences: 3, status: "Resolved" },
    { department: "Pregger", issue: "Mechanical Failure", occurrences: 2, status: "Ongoing" },
]

const shiftSummaryData = [
  { department: 'Pregger', status: 'On Track', details: 'Shift 2 running smoothly.' },
  { department: 'Tapeheads', status: 'Attention', details: 'Spin Out reported on TH-2.' },
  { department: 'Gantry', status: 'On Track', details: 'All molds productive.' },
  { department: 'Films', status: 'On Track', details: 'Normal operations.' },
  { department: 'Graphics', status: 'Delayed', details: 'Printer maintenance caused delay.' },
];

const productionData = [
    { department: "Pregger", meters: 4800 },
    { department: "Tapeheads", meters: 5200 },
    { department: "Gantry", meters: 7500 },
    { department: "Films", meters: 3200 },
    { department: "Graphics", meters: 1500 },
]

const downtimeData = [
  { department: 'Pregger', minutes: 60 },
  { department: 'Tapeheads', minutes: 90 },
  { department: 'Gantry', minutes: 45 },
];


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Dashboard"
        description="Cross-departmental summary for today's date."
      />
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Daily Shift Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Shift Summary</CardTitle>
            <CardDescription>Quick status overview of all departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftSummaryData.map((d) => (
                  <TableRow key={d.department}>
                    <TableCell className="font-medium">{d.department}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'On Track' ? 'default' : 'destructive'} className="capitalize">
                        {d.status === 'On Track' && <CheckCircle className="mr-1 h-3 w-3"/>}
                        {d.status === 'Attention' && <AlertTriangle className="mr-1 h-3 w-3"/>}
                        {d.status === 'Delayed' && <Clock className="mr-1 h-3 w-3"/>}
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sail Output Trends */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Sail Output Trends</CardTitle>
                <CardDescription>Total meters produced by department.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={productionChartConfig} className="h-64 w-full">
                    <BarChart accessibilityLayer data={productionData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="meters" fill="var(--color-meters)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        {/* Downtime Breakdown */}
        <Card>
            <CardHeader>
                <CardTitle>Downtime Breakdown</CardTitle>
                <CardDescription>Total downtime in minutes by department.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={downtimeChartConfig} className="h-64 w-full">
                    <PieChart>
                         <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                         <Pie data={downtimeData} dataKey="minutes" nameKey="department" innerRadius={50}>
                             {downtimeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`var(--color-${entry.department})`} />
                            ))}
                         </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        
        {/* Top Issues */}
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Issues Across Departments</CardTitle>
                 <CardDescription>Most frequent issues reported in the last 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Occurrences</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issuesData.map((issue) => (
                            <TableRow key={issue.issue}>
                                <TableCell>{issue.department}</TableCell>
                                <TableCell className="font-medium">{issue.issue}</TableCell>
                                <TableCell>{issue.occurrences}</TableCell>
                                <TableCell>
                                    <Badge variant={issue.status === "Resolved" ? "secondary" : "destructive"}>
                                        {issue.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
