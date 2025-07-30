
import { PreggerReportForm } from "@/components/pregger-report-form"
import { GenericReportForm } from "@/components/generic-report-form"
import type { Department } from "@/lib/types"
import { GantryReportForm } from "./gantry-report-form"
import { GraphicsReportForm } from "./graphics-report-form"
import { FilmsReportForm } from "./films-report-form"
import { TapeheadsOperatorForm } from "./tapeheads-operator-form"
import type { OeSection } from "@/lib/oe-data"

interface DepartmentReportFormProps {
  department: Department;
  oeSection?: OeSection;
}

export function DepartmentReportForm({ department, oeSection }: DepartmentReportFormProps) {
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

  if (department === 'Tapeheads' && oeSection) {
    return <TapeheadsOperatorForm oeSection={oeSection} />;
  }
  
  return <GenericReportForm department={department} />;
}
