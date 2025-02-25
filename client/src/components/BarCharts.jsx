import React from 'react';
import BarChart from './BarChart';

function BarCharts({ data, maxValue, maxPossibleValue = 1000 }) {
   return (
       <div>
           {Object.entries(data).map(([label, value], index) => (
               <BarChart 
                   key={index} 
                   label={label} 
                   value={value} 
                   maxValue={maxValue}
                   maxPossibleValue={maxPossibleValue}
               />
           ))}
       </div>
   );
}

export default BarCharts
