"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { analyticsData } from "@/lib/data"
import type { DepartmentData } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  total: {
    label: "Units",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function DepartmentChart({ department }: { department: DepartmentData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{department.label}</CardTitle>
        <CardDescription>Daily production units by shift</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart accessibilityLayer data={department.data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Summary of submitted reports across all departments."
      />
      <Tabs defaultValue={analyticsData[0].label}>
        <TabsList>
          {analyticsData.map((dept) => (
            <TabsTrigger key={dept.label} value={dept.label}>
              {dept.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {analyticsData.map((dept) => (
          <TabsContent key={dept.label} value={dept.label} className="mt-6">
            <DepartmentChart department={dept} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
