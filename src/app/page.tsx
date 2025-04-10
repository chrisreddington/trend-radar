import { RingDiagram } from '../components/RingDiagram';
import { ControlPanel } from '../components/ControlPanel';
import { Legend } from '../components/Legend';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8">      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:flex-1 flex justify-center">
          <RingDiagram />
        </div>
        <div className="w-full lg:w-auto lg:max-w-xs space-y-6">
          <ControlPanel />
          <Legend />
        </div>
      </div>
    </main>
  );
}
