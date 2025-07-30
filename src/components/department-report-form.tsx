
import { PreggerReportForm } from "@/components/pregger-report-form"
import { GenericReportForm } from "@/components/generic-report-form"
import type { Department } from "@/lib/types"
import { GantryReportForm } from "./gantry-report-form"
import { GraphicsReportForm } from "./graphics-report-form"
import { FilmsReportForm } from "./films-report-form"
import { TapeheadsOperatorForm } from "./tapeheads-operator-form"

interface DepartmentReportFormProps {
  department: Department;
}

export function DepartmentReportForm({ department }: DepartmentReportFormProps) {
  if (department === 'Pregger') {
    return <PreggerReportForm />;
  }
  
  if (department === 'Gantry') {
    return <GantryReportForm />;
  }

  if (department === 'Graphics') {
    return <GraphicsReportForm />;
  }
  
  if (department === 'Films') {
    return <FilmsReportForm />;
  }

  if (department === 'Tapeheads') {
    return <TapeheadsOperatorForm />;
  }
  
  return <GenericReportForm department={department} />;
}
