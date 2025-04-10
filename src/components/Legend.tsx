"use client";
import { Preparedness } from '../types';

export const Legend = () => {
  return (
    <div className="bg-background p-6 rounded-lg shadow-lg space-y-6 border border-ring-color">
      <div>
        <h3 className="font-semibold text-text-primary mb-3">Size (Relevance)</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-[14px] h-[14px] rounded-full bg-preparedness-moderate" />
            <span className="text-sm text-text-primary">High</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-[10px] h-[10px] rounded-full bg-preparedness-moderate" />
            <span className="text-sm text-text-primary">Moderate</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-[7px] h-[7px] rounded-full bg-preparedness-moderate" />
            <span className="text-sm text-text-primary">Low</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-text-primary mb-3">Color (Preparedness)</h3>
        <div className="space-y-3">
          {Object.values(Preparedness).map(preparedness => (
            <div key={preparedness} className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: preparedness === Preparedness.HighlyPrepared ? 'var(--preparedness-high)' :
                                 preparedness === Preparedness.ModeratelyPrepared ? 'var(--preparedness-moderate)' : 
                                 'var(--preparedness-low)'
                }}
              />
              <span className="text-sm text-text-primary">{preparedness}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-text-secondary space-y-2 border-t border-ring-color pt-4">
        <p>Click on any point to view and edit its details.</p>
        <p>Points are positioned based on their category (quadrant) and likelihood (ring).</p>
      </div>
    </div>
  );
};