import { RingDiagram } from '../components/RingDiagram';
import { ControlPanel } from '../components/ControlPanel';
import { Legend } from '../components/Legend';

export default function Home() {
  return (
    <main className="flex min-h-screen p-8">
      <div className="flex-1">
        <RingDiagram />
      </div>
      <div className="flex-shrink-0 space-y-4">
        <ControlPanel />
        <Legend />
      </div>
    </main>
  );
}
