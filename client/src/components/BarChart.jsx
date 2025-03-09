import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';

function BarChart({ label, value, maxValue, maxPossibleValue = 1000 }) {
    const { theme, isDark } = useTheme();
    const [width, setWidth] = useState(0);
    const [showValue, setShowValue] = useState(false);
    
    // Calculate width percentage based on maxValue for visual scaling
    const widthPercentage = (value / maxValue) * 100;
    // Calculate percentage of maximum possible points
    const percentOfMax = Math.round((value / maxPossibleValue) * 100);

    const colorMapping = {
        Physical: theme.barChart1,
        Psychological: theme.barChart2,
        Social: theme.barChart3,
        Cognitive: theme.barChart4
    };

    const labelIcons = {
        Physical: faDumbbell,
        Psychological: faHeart,
        Social: faUsers,
        Cognitive: faBrain
    };

    const color = colorMapping[label]; 
    const icon = labelIcons[label];
    
    // Animate bar width and label on mount
    useEffect(() => {
        // Small initial delay for staggered appearance
        const timer = setTimeout(() => {
            setWidth(Math.min(widthPercentage, 100));
        }, 100);
        
        // Show value with a slight delay after bar appears
        const valueTimer = setTimeout(() => {
            setShowValue(true);
        }, 600);
        
        return () => {
            clearTimeout(timer);
            clearTimeout(valueTimer);
        };
    }, [widthPercentage]);

    return (
        <div className="flex flex-col lg:flex-row items-start mb-6 transform transition-all duration-300 hover:scale-102">
            <div className="lg:w-2/5 flex items-center mb-2 lg:mb-0">
                <div 
                    className={`${isDark ? 'bg-gray-700' : 'bg-violet-100'} p-2 rounded-full mr-3 
                              transition-all duration-300 hover:scale-110 hover:shadow-lg
                              animate-fadeIn group relative`}
                >
                    <FontAwesomeIcon 
                        icon={icon} 
                        size="lg" 
                        className={`${isDark ? theme.textViolet : 'text-violet-800'} 
                                 transition-all duration-300 group-hover:animate-pulse`}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white 
                                  text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        {label} score
                    </div>
                </div>
                <span className={`font-medium ${theme.textSecondary} animate-fadeIn`}>{label}</span>
            </div>
            <div className="w-full lg:w-3/5">
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden shadow-inner">
                    <div 
                        className={`h-8 absolute left-0 rounded-full ${color} transform transition-all ease-out duration-1000`} 
                        style={{ width: `${width}%`, transitionDelay: '200ms' }}
                    ></div>
                    {showValue && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 animate-fadeIn">
                            <span className="text-white text-sm font-medium drop-shadow-md">
                                {value} p ({percentOfMax}%)
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Keyframes for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes scale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .hover\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}

export default BarChart;
