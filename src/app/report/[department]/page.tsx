import { DepartmentReportForm } from "@/components/department-report-form";
import { PageHeader } from "@/components/page-header";
import type { Department } from "@/lib/types";
import { notFound } from "next/navigation";

const validDepartments: Department[] = ['Pregger', 'Tapeheads', 'Gantry', 'Films', 'Graphics'];

function isValidDepartment(department: string): department is Department {
  return (validDepartments as string[]).includes(department);
}


export default function ReportPage({ params }: { params: { department: string } }) {
  const departmentName = params.department.charAt(0).toUpperCase() + params.department.slice(1) as Department;
  
  if (!isValidDepartment(departmentName)) {
    notFound();
  }
  
  if (departmentName === 'Graphics') {
    return <DepartmentReportForm department={departmentName} />;
  }
  
  return (
    <div>
      <PageHeader
        title="Shift Report Entry"
        description={`Submit your daily report for the ${departmentName} department.`}
      />
      <DepartmentReportForm department={departmentName} />
    </div>
  );
}

export function generateStaticParams() {
  return validDepartments.map((department) => ({
    department: department.toLowerCase(),
  }))
}
