import { RingDiagram } from '../components/RingDiagram';
import { ControlPanel } from '../components/ControlPanel';
import { Legend } from '../components/Legend';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-end mb-4">
        <ThemeSwitcher />
      </div>
      
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center mb-6 lg:mb-0">
          <RingDiagram />
        </div>
        <div className="w-full lg:w-auto lg:flex-shrink-0 lg:ml-6 space-y-6">
          <ControlPanel />
          <Legend />
        </div>
      </div>
    </main>
  );
}
