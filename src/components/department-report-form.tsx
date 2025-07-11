import { PreggerReportForm } from "@/components/pregger-report-form"
import { GenericReportForm } from "@/components/generic-report-form"
import { TapeheadsOperatorForm } from "@/components/tapeheads-operator-form"
import type { Department } from "@/lib/types"

interface DepartmentReportFormProps {
  department: Department;
}

export function DepartmentReportForm({ department }: DepartmentReportFormProps) {
  if (department === 'Pregger') {
    return <PreggerReportForm />;
  }
  
  if (department === 'Tapeheads') {
    return <TapeheadsOperatorForm />;
  }
  
  return <GenericReportForm department={department} />;
}
