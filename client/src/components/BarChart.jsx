import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';

function BarChart({ label, value, maxValue, maxPossibleValue = 1000 }) {
    const { theme, isDark } = useTheme();
    
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

    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-start">
            <div className="lg:w-2/5 flex items-center mb-2 lg:mb-0">
                <div className={`${isDark ? 'bg-gray-700' : 'bg-violet-100'} p-2 rounded-full mr-3 transition-all duration-200 hover:scale-110 hover:shadow-md`}>
                    <FontAwesomeIcon 
                        icon={icon} 
                        size="lg" 
                        className={isDark ? theme.textViolet : 'text-violet-800'}
                        // Removed beat prop and replaced with hover effect in parent div
                    />
                </div>
                <span className={`font-medium ${theme.textSecondary}`}>{label}</span>
            </div>
            <div className="w-full lg:w-3/5">
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                    <div 
                        className={`h-8 absolute left-0 rounded-full transition-all duration-1000 ease-out ${color}`} 
                        style={{ width: `${Math.min(widthPercentage, 100)}%` }}
                    ></div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-sm font-medium">
                        {value} p ({percentOfMax}%)
                    </span>
                </div>
            </div>
        </div>
    );
}

export default BarChart;
