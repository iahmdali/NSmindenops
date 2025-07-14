import { DepartmentAnalyticsPage } from "@/components/analytics/department-analytics-page";
import type { Department } from "@/lib/types";
import { notFound } from "next/navigation";

const validDepartments: Department[] = ['Pregger', 'Tapeheads', 'Gantry', 'Films', 'Graphics'];

function isValidDepartment(department: string): department is Department {
  return (validDepartments as string[]).includes(department);
}

export default async function AnalyticsPage({ params }: { params: { department: string } }) {
  const departmentName = params.department.charAt(0).toUpperCase() + params.department.slice(1);
  
  if (!isValidDepartment(departmentName)) {
    notFound();
  }
  
  return <DepartmentAnalyticsPage department={departmentName} />;
}

export function generateStaticParams() {
  return validDepartments.map((department) => ({
    department: department.toLowerCase(),
  }))
}
