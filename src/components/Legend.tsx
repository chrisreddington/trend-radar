"use client";
import { Relevance, Preparedness } from '../types';

export const Legend = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">Point Size (Relevance)</h3>
        <div className="space-y-2">
          {Object.values(Relevance).map(relevance => (
            <div key={relevance} className="flex items-center space-x-2">
              <div 
                className="rounded-full bg-gray-400" 
                style={{ 
                  width: relevance === Relevance.High ? '12px' : 
                         relevance === Relevance.Moderate ? '8px' : '6px',
                  height: relevance === Relevance.High ? '12px' : 
                         relevance === Relevance.Moderate ? '8px' : '6px'
                }}
              />
              <span className="text-sm">{relevance}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-2">Color (Preparedness)</h3>
        <div className="space-y-2">
          {Object.values(Preparedness).map(preparedness => (
            <div key={preparedness} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: preparedness === Preparedness.HighlyPrepared ? '#22c55e' :
                                 preparedness === Preparedness.ModeratelyPrepared ? '#eab308' : '#ef4444'
                }}
              />
              <span className="text-sm">{preparedness}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>Click on any point to view and edit its details.</p>
        <p>Points are positioned based on their category (quadrant) and likelihood (ring).</p>
      </div>
    </div>
  );
};