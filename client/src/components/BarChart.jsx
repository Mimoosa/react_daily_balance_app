import React from 'react';
import { themes } from '../contexts/themeConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faBrain, faUsers, faHeart } from '../contexts/icons';

function BarChart({ label, value, maxValue, maxPossibleValue = 1000 }) {
    const theme = themes.light; 
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
    }

    const color = colorMapping[label]; 

    const icon = labelIcons[label]; 

    return (
        <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/4">
                <FontAwesomeIcon icon={icon} size="xl" className="text-black"/>
                <span className="ml-2 text-black">{label}</span>
            </div>
            <div className="mt-2 lg:mt-0 lg:w-2/4">
                <div className={`relative ${color} h-8 mb-4 rounded-tr-full rounded-br-full`} style={{ width: `${widthPercentage}%` }}>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white">{value} p ({percentOfMax}%)</span>
                </div>
            </div>
        </div>
    );
}

export default BarChart;
