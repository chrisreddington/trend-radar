import { RingDiagram } from "../components/ring-diagram";
import { ControlPanel } from "../components/control-panel";
import { Legend } from "../components/legend";
import { PointsTable } from "../components/points-table";
import { FileOperations } from "../components/file-operations";
import { ThemeToggle } from "../components/theme-toggle";
import { ViewSourceOnGitHub } from "@/components/view-github-source";
import { DiagramPersistenceWatcher } from "@/components/diagram-persistence-watcher";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 bg-white dark:bg-gray-900">
      <DiagramPersistenceWatcher />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:flex-1 flex justify-center">
          <ErrorBoundary>
            <RingDiagram />
          </ErrorBoundary>
        </div>
        <div className="w-full lg:w-auto lg:max-w-xs space-y-6">
          <ViewSourceOnGitHub repoUrl="https://github.com/chrisreddington/trend-radar" />
          <ThemeToggle />
          <FileOperations />
          <ControlPanel />
          <Legend />
        </div>
      </div>
      <div className="mt-6">
        <PointsTable />
      </div>
    </main>
  );
}
