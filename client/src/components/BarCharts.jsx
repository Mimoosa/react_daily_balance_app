import React, { useEffect, useState } from 'react';
import BarChart from './BarChart';
import { useTheme } from '../contexts/ThemeContext';

function BarCharts({ data, maxValue, maxPossibleValue = 1000 }) {
   const { theme } = useTheme();
   const [isVisible, setIsVisible] = useState(false);
   const barCategories = Object.keys(data);
   
   // Animation delay for staggered appearance
   const getDelay = (index) => `${150 * index}ms`;
   
   // Use intersection observer to trigger animations when component is visible
   useEffect(() => {
       const observer = new IntersectionObserver(
           ([entry]) => {
               if (entry.isIntersecting) {
                   setIsVisible(true);
                   observer.disconnect();
               }
           },
           { threshold: 0.2 }  // Trigger when 20% of element is visible
       );
       
       // Get the container element
       const container = document.getElementById("bar-charts-container");
       if (container) {
           observer.observe(container);
       }
       
       return () => {
           if (container) {
               observer.unobserve(container);
           }
       };
   }, []);
   
   return (
       <div 
           id="bar-charts-container" 
           className={`space-y-1 py-4 transition-all duration-700 ${
               isVisible ? 'opacity-100' : 'opacity-0 transform translate-y-4'
           }`}
       >
           {barCategories.map((label, index) => (
               <div 
                   key={index}
                   className={`transition-all transform ${isVisible ? 'animate-slideIn' : ''}`}
                   style={{ animationDelay: getDelay(index) }}
               >
                   <BarChart 
                       label={label} 
                       value={data[label]} 
                       maxValue={maxValue}
                       maxPossibleValue={maxPossibleValue}
                   />
               </div>
           ))}
           
           <style>{`
               @keyframes slideIn {
                   from { 
                       opacity: 0;
                       transform: translateX(-20px);
                   }
                   to { 
                       opacity: 1;
                       transform: translateX(0);
                   }
               }
               .animate-slideIn {
                   animation: slideIn 0.6s ease-out forwards;
               }
           `}</style>
       </div>
   );
}

export default BarCharts;
