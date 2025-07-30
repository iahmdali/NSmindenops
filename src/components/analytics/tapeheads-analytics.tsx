
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Pie, PieChart, Cell, Line, LineChart, ResponsiveContainer, Legend, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Gauge, Clock, Zap, AlertTriangle } from "lucide-react"
import type { Report } from "@/lib/types"
import { tapeheadsSubmissions } from "@/lib/tapeheads-data"
import { Badge } from "../ui/badge"
import { PageHeader } from "../page-header"

const downtimeReasonsConfig = {
    "Machine Jam": { label: 'Machine Jam', color: 'hsl(var(--chart-1))' },
    "Material Shortage": { label: 'Material Shortage', color: 'hsl(var(--chart-2))' },
    "Spin Out": { label: 'Spin Out', color: 'hsl(var(--chart-3))' },
    "Other": { label: 'Other', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

const productionChartConfig = {
  meters: { label: "Meters", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const mpmhChartConfig = {
  mpmh: { label: "MPMH", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const calculateHours = (startTimeStr?: string, endTimeStr?: string): number => {
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

export function TapeheadsAnalytics() {
  const [data, setData] = React.useState<Report[]>(tapeheadsSubmissions);
  const [filters, setFilters] = React.useState({
    shift: 'all',
    operatorName: '',
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  React.useEffect(() => {
    const filteredData = tapeheadsSubmissions.filter(report => {
        if (filters.shift !== 'all' && String(report.shift) !== filters.shift) return false;
        if (filters.operatorName && !report.operatorName.toLowerCase().includes(filters.operatorName.toLowerCase())) return false;
        return true;
    });
    setData(filteredData);
  }, [filters]);
  
  const kpiData = React.useMemo(() => {
    const totalMeters = data.reduce((acc, report) => acc + report.total_meters, 0);
    const totalHours = data.reduce((acc, report) => acc + calculateHours(report.shift_start_time, report.shift_end_time), 0);
    const totalDowntime = data.reduce((acc, report) => {
        const issuesDowntime = report.issues?.reduce((sum, issue) => sum + issue.duration_minutes, 0) || 0;
        const spinoutDowntime = report.had_spin_out ? (report.spin_out_duration_minutes || 0) : 0;
        return acc + issuesDowntime + spinoutDowntime;
    }, 0);
    const totalSpinOuts = data.filter(r => r.had_spin_out).length;
    const averageMpmh = totalHours > 0 ? (totalMeters / totalHours) : 0;

    return {
      totalMeters: totalMeters.toLocaleString(),
      averageMpmh: `${averageMpmh.toFixed(1)} m/hr`,
      totalDowntime: `${totalDowntime.toLocaleString()} min`,
      totalSpinOuts: totalSpinOuts,
    };
  }, [data]);
  
  const productionByDay = React.useMemo(() => {
    const dailyData: { [key: string]: { date: string, meters: number } } = {};
    data.forEach(report => {
      const date = new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { date, meters: 0 };
      }
      dailyData[date].meters += report.total_meters;
    });
    return Object.values(dailyData).slice(-14); // Last 14 days
  }, [data]);

  const downtimeByReason = React.useMemo(() => {
    const reasonData: { [key: string]: number } = { "Machine Jam": 0, "Material Shortage": 0, "Spin Out": 0, "Other": 0 };
    data.forEach(report => {
      report.issues?.forEach(d => {
        const reason = d.problem_reason in reasonData ? d.problem_reason : "Other";
        reasonData[reason] = (reasonData[reason] || 0) + d.duration_minutes;
      });
      if(report.had_spin_out) {
        reasonData["Spin Out"] += report.spin_out_duration_minutes || 0;
      }
    });
    return Object.entries(reasonData).map(([name, value]) => ({ name, value, fill: `var(--color-${name.replace(/\s/g, '')})` })).filter(d => d.value > 0);
  }, [data]);

   const mpmhByShift = React.useMemo(() => {
    const shiftData: { [key: string]: { totalMeters: number, totalHours: number } } = { '1': { totalMeters: 0, totalHours: 0 }, '2': { totalMeters: 0, totalHours: 0 }, '3': { totalMeters: 0, totalHours: 0 } };
    data.forEach(report => {
        const shiftKey = String(report.shift);
        if (shiftData[shiftKey]) {
            shiftData[shiftKey].totalMeters += report.total_meters;
            shiftData[shiftKey].totalHours += calculateHours(report.shift_start_time, report.shift_end_time);
        }
    });
    return Object.entries(shiftData).map(([shift, values]) => ({
        name: `Shift ${shift}`,
        mpmh: values.totalHours > 0 ? parseFloat((values.totalMeters / values.totalHours).toFixed(1)) : 0
    }));
  }, [data]);

  const thPerformance = React.useMemo(() => {
    const thData: { [key: string]: { totalHours: number, totalMeters: number, spinOuts: number, operators: Set<string> } } = {};
    
    data.forEach(report => {
        if (!thData[report.th_number]) {
            thData[report.th_number] = { totalHours: 0, totalMeters: 0, spinOuts: 0, operators: new Set() };
        }
        const d = thData[report.th_number];
        d.totalHours += calculateHours(report.shift_start_time, report.shift_end_time);
        d.totalMeters += report.total_meters;
        if (report.had_spin_out) d.spinOuts++;
        d.operators.add(report.operatorName);
    });

    return Object.entries(thData).map(([th, d]) => ({
        th_number: th,
        ...d,
        efficiency: d.totalHours > 0 ? (d.totalMeters / d.totalHours).toFixed(1) : 0,
        spinOutRate: d.totalHours > 0 ? (d.spinOuts / d.totalHours * 100).toFixed(1) : 0, // as percentage
    })).sort((a, b) => a.th_number.localeCompare(b.th_number));
  }, [data]);


  return (
    <div className="space-y-6">
        <PageHeader title="3Di Leads – Tape Head Performance Analytics" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total Output (m)</CardTitle><Target className="h-4 w-4 text-green-600 dark:text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-900 dark:text-green-100">{kpiData.totalMeters}</div></CardContent></Card>
            <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Average Productivity</CardTitle><Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{kpiData.averageMpmh}</div></CardContent></Card>
            <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Total Downtime</CardTitle><Clock className="h-4 w-4 text-red-600 dark:text-red-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-900 dark:text-red-100">{kpiData.totalDowntime}</div></CardContent></Card>
            <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Spin-out Events</CardTitle><Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{kpiData.totalSpinOuts}</div></CardContent></Card>
        </div>

        <Card>
            <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent className="flex items-end gap-4">
                <div className="grid gap-2"><Label htmlFor="shift-filter">Shift</Label>
                    <Select value={filters.shift} onValueChange={value => handleFilterChange('shift', value)}>
                        <SelectTrigger id="shift-filter" className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Shifts</SelectItem><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2"><Label htmlFor="op-name">Operator Name</Label><Input id="op-name" placeholder="Filter by operator..." value={filters.operatorName} onChange={e => handleFilterChange('operatorName', e.target.value)} /></div>
            </CardContent>
        </Card>

        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Production Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                <TabsTrigger value="issues">Quality & Issues</TabsTrigger>
                <TabsTrigger value="th-perf">TH Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Meters Produced (Last 14 Days)</CardTitle></CardHeader>
                    <CardContent>
                         <ChartContainer config={productionChartConfig} className="h-72 w-full">
                            <AreaChart accessibilityLayer data={productionByDay} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                <Area dataKey="meters" type="natural" fill="var(--color-meters)" fillOpacity={0.4} stroke="var(--color-meters)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <Card>
                        <CardHeader><CardTitle>Average MPMH by Shift</CardTitle></CardHeader>
                        <CardContent>
                           <ChartContainer config={mpmhChartConfig} className="h-72 w-full">
                                <BarChart data={mpmhByShift}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="mpmh" fill="var(--color-mpmh)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Downtime Reasons</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={downtimeReasonsConfig} className="h-72 w-full">
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie data={downtimeByReason} dataKey="value" nameKey="name" innerRadius={50}>
                                        {downtimeByReason.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="performance">
                 <Card><CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader><CardContent><p>Performance metrics charts will be displayed here.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="issues">
                <Card><CardHeader><CardTitle>Quality & Issues</CardTitle></CardHeader><CardContent><p>Quality and issues charts will be displayed here.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="th-perf">
                <Card>
                    <CardHeader><CardTitle>Tape Head (TH) Utilization & Performance</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>TH#</TableHead>
                                    <TableHead>Total Hours</TableHead>
                                    <TableHead>Total Meters</TableHead>
                                    <TableHead>Efficiency (m/hr)</TableHead>
                                    <TableHead>Spin-Out Rate (%)</TableHead>
                                    <TableHead>Operators</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {thPerformance.map(th => (
                                    <TableRow key={th.th_number}>
                                        <TableCell className="font-bold">{th.th_number}</TableCell>
                                        <TableCell>{th.totalHours}</TableCell>
                                        <TableCell>{th.totalMeters.toLocaleString()}</TableCell>
                                        <TableCell>{th.efficiency}</TableCell>
                                        <TableCell>{th.spinOutRate}%</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{Array.from(th.operators).join(', ')}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
