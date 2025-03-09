import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export const ActivityPrompt = ({ isOpen, onClose, type }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleGoToActivity = () => {
        const params = type === 'edit' ? '?edited=true' : '';
        navigate(`/activity${params}`);
        onClose();
    };

    return (
        <div className="fixed inset-x-0 bottom-4 mx-auto max-w-xl px-4 z-50">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-violet-100 dark:border-violet-900 overflow-hidden">
                {/* Success indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-300" />
                
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div className="mr-3 text-green-500 dark:text-green-400">
                                <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {type === 'new' ? 'Journal Entry Created!' : 'Journal Entry Updated!'}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {type === 'new' 
                            ? "Let's calculate your activity points based on your journal entry."
                            : "Would you like to recalculate your points with the updated entry?"}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleGoToActivity}
                            className="flex items-center px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                        >
                            View Activity Report
                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityPrompt;