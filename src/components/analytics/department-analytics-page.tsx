import type { Department } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { PreggerAnalytics } from "./pregger-analytics";
import { TapeheadsAnalytics } from "./tapeheads-analytics";
import { GantryAnalytics } from "./gantry-analytics";
import { FilmsAnalytics } from "./films-analytics";
import { GraphicsAnalytics } from "./graphics-analytics";

interface DepartmentAnalyticsPageProps {
  department: Department;
}

export function DepartmentAnalyticsPage({ department }: DepartmentAnalyticsPageProps) {

  const renderAnalyticsComponent = () => {
    switch(department) {
      case 'Pregger':
        return <PreggerAnalytics />;
      case 'Tapeheads':
        return <TapeheadsAnalytics />;
      case 'Gantry':
        return <GantryAnalytics />;
      case 'Films':
        return <FilmsAnalytics />;
      case 'Graphics':
        return <GraphicsAnalytics />;
      default:
        return <p>No analytics available for this department.</p>;
    }
  }

  return (
    <div>
      <PageHeader
        title={`${department} Analytics`}
        description={`Detailed analytics and performance metrics for the ${department} department.`}
      />
      {renderAnalyticsComponent()}
    </div>
  );
}
