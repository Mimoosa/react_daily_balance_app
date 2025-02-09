import React from 'react';
import BarChart from './BarChart';

function BarCharts({ data, maxValue }) {
   return (
       <div>
           {Object.entries(data).map(([label, value], index) => (
               <BarChart key={index} label={label}  value={value} maxValue={maxValue}/>
           ))}
       </div>
   );
}

export default BarCharts
