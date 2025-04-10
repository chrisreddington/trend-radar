"use client";
import { useState } from 'react';
import { Preparedness } from '../types';

export const Legend = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="w-full lg:w-80 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4 cursor-pointer" onClick={toggleCollapse}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <button 
            className="w-full flex justify-between items-center focus:outline-none"
            aria-expanded={!isCollapsed}
            aria-controls="legend-content"
          >
            Legend
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </h2>
      </div>
      <div 
        id="legend-content"
        className={`p-6 pt-0 ${isCollapsed ? 'hidden' : ''}`}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Size (Relevance)</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-[14px] h-[14px] rounded-full bg-preparedness-moderate" role="presentation" />
                <span className="text-sm text-gray-700 dark:text-gray-200">High</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-[10px] h-[10px] rounded-full bg-preparedness-moderate" role="presentation" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Moderate</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-[7px] h-[7px] rounded-full bg-preparedness-moderate" role="presentation" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Low</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Color (Preparedness)</h3>
            <div className="space-y-3">
              {Object.values(Preparedness).map(preparedness => (
                <div key={preparedness} className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    role="presentation"
                    style={{ 
                      backgroundColor: preparedness === Preparedness.HighlyPrepared ? 'var(--preparedness-high)' :
                                     preparedness === Preparedness.ModeratelyPrepared ? 'var(--preparedness-moderate)' : 
                                     'var(--preparedness-low)'
                    }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{preparedness}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-300 dark:border-gray-600 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Click on any point to view and edit its details.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Points are positioned based on their category (quadrant) and likelihood (ring).</p>
          </div>
        </div>
      </div>
    </div>
  );
};