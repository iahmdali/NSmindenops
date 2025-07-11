import { PreggerReportForm } from "@/components/pregger-report-form"
import { GenericReportForm } from "@/components/generic-report-form"
import { TapeheadsOperatorForm } from "@/components/tapeheads-operator-form"
import type { Department } from "@/lib/types"
import { GantryReportForm } from "./gantry-report-form"

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

  if (department === 'Gantry') {
    return <GantryReportForm />;
  }
  
  return <GenericReportForm department={department} />;
}
