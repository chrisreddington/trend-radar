import { RingDiagram } from '../components/RingDiagram';
import { ControlPanel } from '../components/ControlPanel';
import { Legend } from '../components/Legend';

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex">
      <div className="flex-1 flex items-center justify-center">
        <RingDiagram />
      </div>
      <div className="flex-shrink-0 space-y-6">
        <ControlPanel />
        <Legend />
      </div>
    </main>
  );
}
