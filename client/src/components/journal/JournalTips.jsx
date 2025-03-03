import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faSmile, faUsers, faBrain, faPencil } from '@fortawesome/free-solid-svg-icons';

const JournalTips = () => {
    const { theme, isDark } = useTheme();

    const tips = [
        {
            icon: faClock,
            title: "Activities & Duration",
            text: "\"walked for 30 min\", \"gym session\", etc."
        },
        {
            icon: faSmile,
            title: "Feelings & Mood",
            text: "Share your emotional state throughout the day"
        },
        {
            icon: faUsers,
            title: "Social Interactions",
            text: "Record meetings and conversations"
        },
        {
            icon: faBrain,
            title: "Mental Activities",
            text: "Study, work tasks, creative hobbies"
        },
        {
            icon: faPencil,
            title: "Writing Guide",
            text: "Min. 10 characters for analysis"
        }
    ];

    return (
        <div className="space-y-4">
            {/* Date display */}
            <div className={`text-center ${theme.textViolet} text-lg font-medium`}>
                {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </div>

            {/* Journal writing guidelines - Horizontal gallery style */}
            <div className={`max-w-2xl mx-auto ${theme.backgroundCard} rounded-lg shadow-lg p-4 ${theme.cardShadow || ''}`}>
                <h3 className={`font-bold text-lg mb-3 ${theme.textViolet} text-center`}>
                    Quick Writing Tips
                </h3>
                <div className="relative">
                    <div className="custom-scrollbar overflow-x-auto pb-4">
                        <div className="flex space-x-3 min-w-min px-1">
                            {tips.map((tip, index) => (
                                <div 
                                    key={index} 
                                    className={`
                                        flex-none w-[160px] p-3 ${theme.inputBackground || 'bg-white'} rounded-lg shadow-sm 
                                        hover:shadow-md transition-all duration-200 
                                        transform hover:-translate-y-1 cursor-pointer
                                        flex flex-col items-center text-center
                                    `}
                                >
                                    <div className={`
                                        ${theme.backgroundViolet} p-2 rounded-full text-white 
                                        mb-2 w-10 h-10 flex items-center justify-center
                                    `}>
                                        <FontAwesomeIcon icon={tip.icon} className="w-5 h-5" />
                                    </div>
                                    <h4 className={`${theme.textViolet} font-semibold text-sm mb-1`}>
                                        {tip.title}
                                    </h4>
                                    <p className={`${theme.textSecondary || 'text-gray-600'} text-xs`}>
                                        {tip.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                .custom-scrollbar {
                    /* For Webkit browsers (Chrome, Safari) */
                    &::-webkit-scrollbar {
                        height: 6px;
                        width: 6px;
                    }

                    &::-webkit-scrollbar-track {
                        background: ${isDark ? '#4B5563' : '#f1f1f1'};
                        border-radius: 3px;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: ${isDark ? '#8B5CF6' : '#8b5cf6'};
                        border-radius: 3px;
                        transition: all 0.2s ease;
                    }

                    &::-webkit-scrollbar-thumb:hover {
                        background: ${isDark ? '#7C3AED' : '#7c3aed'};
                    }

                    /* For Firefox */
                    scrollbar-width: thin;
                    scrollbar-color: ${isDark ? '#8B5CF6 #4B5563' : '#8b5cf6 #f1f1f1'};
                }

                /* For Edge and IE */
                .custom-scrollbar {
                    -ms-overflow-style: auto;
                }

                /* Smooth scrolling for all browsers */
                .custom-scrollbar {
                    scroll-behavior: smooth;
                }

                /* Better touch scrolling for mobile */
                @media (hover: none) {
                    .custom-scrollbar {
                        -webkit-overflow-scrolling: touch;
                    }
                }
            `}</style>
        </div>
    );
};

export default JournalTips;