import React from 'react';
import BarChart from './BarChart';
import { useTheme } from '../contexts/ThemeContext';

function BarCharts({ data, maxValue, maxPossibleValue = 1000 }) {
   const { theme } = useTheme();
   
   // Animation delay for staggered appearance
   const getDelay = (index) => `${100 * index}ms`;
   
   return (
       <div className="space-y-6 py-2">
           {Object.entries(data).map(([label, value], index) => (
               <div 
                   key={index}
                   className={`transition-all transform animate-fadeIn`}
                   style={{ animationDelay: getDelay(index) }}
               >
                   <BarChart 
                       label={label} 
                       value={value} 
                       maxValue={maxValue}
                       maxPossibleValue={maxPossibleValue}
                   />
               </div>
           ))}
           
           <style jsx>{`
               @keyframes fadeIn {
                   from { opacity: 0; transform: translateY(10px); }
                   to { opacity: 1; transform: translateY(0); }
               }
               .animate-fadeIn {
                   animation: fadeIn 0.5s ease-out forwards;
               }
           `}</style>
       </div>
   );
}

export default BarCharts;
