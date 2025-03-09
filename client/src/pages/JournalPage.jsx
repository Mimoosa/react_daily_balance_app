import { useState, useEffect } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { journalService } from '../services/api';
import JournalEntries from '../components/journal/JournalEntries';
import { useNavigate } from 'react-router-dom';
import JournalTips from '../components/journal/JournalTips';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { config } from '@fortawesome/fontawesome-svg-core';
import { useScreenContext } from '../contexts/ScreenContext'
import { ActivityPrompt } from '../components/journal/ActivityPrompt';
config.autoAddCss = false;

/**
 * JournalPage Component
 * A component that manages journal entries with AI-powered analysis.
 * Features:
 * - Create new journal entries
 * - View past entries
 * - Edit today's entry
 * - AI analysis of entries using Gemini
 * - Sidebar navigation for past entries
 * 
 * @component
 */
const JournalPage = () => {
    const { theme, isDark } = useTheme();
    const [content, setContent] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [journals, setJournals] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showActivityPrompt, setShowActivityPrompt] = useState(false);
    const [promptType, setPromptType] = useState(''); // 'new' or 'edit'
    const navigate = useNavigate();
    const { isLargeScreen } = useScreenContext;

    /**
     * Fetches user's journal entries on component mount
     * @async
     * @function
     */
    useEffect(() => {
        fetchJournals();
    }, []);

    /**
     * Retrieves journal entries from the API and updates state
     * @async
     * @function
     */
    const fetchJournals = async () => {
        try {
            const data = await journalService.getEntries();
            setJournals(data);
        } catch (error) {
            setError('Failed to fetch journal entries');
        }
    };

    /**
     * Handles the submission of a new journal entry
     * @async
     * @function
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Please write something in your journal entry');
            return;
        }

        setLoading(true);
        try {
            const data = await journalService.createEntry(content);
            setAnalysis(data.analysis);
            setContent('');
            await fetchJournals(); // Refresh the list
            setShowActivityPrompt(true);
            setPromptType('new');
        } catch (error) {
            setError(error.message || 'Failed to save journal entry');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Selects a journal entry for viewing/editing
     * @function
     * @param {Object} entry - The journal entry to select
     * @param {string} entry._id - Entry ID
     * @param {string} entry.content - Entry content
     * @param {Object} entry.analysis - AI analysis of the entry
     */
    const handleEntrySelect = (entry) => {
        setSelectedEntry(entry);
        setContent(entry.content);
        setAnalysis(entry.analysis);
        setIsEditing(true);
    };

    /**
     * Updates the currently selected journal entry
     * Only works for today's entry
     * @async
     * @function
     */
    const handleUpdate = async () => {
        if (!selectedEntry) return;

        setLoading(true);
        try {
            // Add confirmation when updating today's entry with points
            const isToday = new Date(selectedEntry.date).toDateString() === new Date().toDateString();

            if (isToday && selectedEntry.activitiesProcessed) {
                const confirmUpdate = window.confirm(
                    "This journal entry already has activity points calculated. Updating will reset these points and require recalculation. Continue?"
                );

                if (!confirmUpdate) {
                    setLoading(false);
                    return;
                }
            }

            await journalService.updateEntry(selectedEntry._id, content);

            // Check if this is today's entry to redirect properly
            if (isToday) {
                setShowActivityPrompt(true);
                setPromptType('edit');
            } else {
                await fetchJournals();
                setIsEditing(false);
            }
        } catch (error) {
            setError(error.message || 'Failed to update entry');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the submission of an edited journal entry
     * @async
     * @function
     * @param {string} id - The ID of the journal entry to update
     * @param {string} content - The updated content of the journal entry
     */
    const handleEditSubmit = async (id, content) => {
        try {
            await journalService.updateEntry(id, content);

            // Check if the edited journal is today's entry
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const journalDate = new Date(selectedEntry.date);
            journalDate.setHours(0, 0, 0, 0);

            if (journalDate.getTime() === today.getTime()) {
                console.log("Today's journal edited - redirecting to activity page with edited=true");

                // Use navigate with proper params
                navigate('/activity?edited=true');
                return;
            }

            // For past journals, just refresh the list
            fetchJournals();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating journal:", error);
            setError("Failed to update journal entry");
        }
    };

    /**
     * Navigates to the activity report page
     * @function
     */
    const analysisCompleted = () => {
        navigate('/activity');
    };

    /**
     * Checks if a given date is today
     * @function
     * @param {Date|string} date - The date to check
     * @returns {boolean} True if the date is today, false otherwise
     */

    const handleGoToActivity = () => {
        const params = promptType === 'edit' ? '?edited=true' : '';
        navigate(`/activity${params}`);
        setShowActivityPrompt(false);
    };

    return (
        <div className={`pb-14 flex flex-col ${theme.backgroundWhite}`}  style={isLargeScreen ? { height: `calc(100vh - 64px)`} : {}} >

            {/* Main content area */}
            <div className="flex flex-col-reverse lg:flex-row flex-1">
                {/* Journal entries section */}
                <div className={`lg:w-64 border-t lg:border-t-0 lg:border-r ${theme.divider || theme.border}`}>
                    {/* Desktop view - side panel */}
                    <div className="hidden lg:block h-full">
                        <div className={`border-b ${theme.divider || theme.border} p-4`}>
                            <h3 className={`font-bold text-lg ${theme.textViolet}`}>Journal Entries</h3>
                        </div>
                        <JournalEntries
                            journals={journals}
                            selectedEntry={selectedEntry}
                            onEntrySelect={handleEntrySelect}
                        />
                    </div>

                    {/* Mobile view - bottom section */}
                    <div className="lg:hidden mt-8">
                        <div className="p-4">
                            <h3 className={`font-bold text-lg ${theme.textViolet} mb-4`}>Previous Entries</h3>
                            <JournalEntries
                                journals={journals}
                                selectedEntry={selectedEntry}
                                onEntrySelect={handleEntrySelect}
                            />
                        </div>
                    </div>
                </div>

                {/* Journal input and analysis section */}
                <div className="flex flex-col flex-1 w-full">
                    <div className={`py-8 px-6 ${isDark ? 'bg-violet-950/30' : 'bg-violet-50/70'}`}>
                        <h1 className={`text-3xl lg:text-4xl font-bold text-center ${theme.textViolet} flex items-center justify-center gap-3`}>
                            <FontAwesomeIcon icon={faBook} className={`${theme.textViolet}`} />
                            Daily Journal
                        </h1>
                    </div>
                    <div className="flex-1 p-4 lg:p-6">
                        <JournalTips />

                        {error && (
                            <div className={`mb-4 p-3 ${theme.alert} bg-red-50 dark:bg-red-900/20 rounded-lg`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <textarea
                                    className={`w-full h-48 p-3 border rounded-lg focus:outline-none ${error ? 'border-red-500' : theme.border
                                        } ${theme.inputBackground || 'bg-white'} ${theme.textSecondary}`}
                                    placeholder="How was your day? Share your activities and experiences..."
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        setError('');
                                    }}
                                    minLength={10}
                                />
                                <div className={`absolute bottom-2 right-2 text-sm ${theme.textSecondary || 'text-gray-500'}`}>
                                    {content.length} characters (min. 10)
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            className={`flex-1 mt-4 ${theme.backgroundViolet} ${theme.backgroundHover || 'hover:bg-violet-900'} text-white py-2 px-4 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors`}
                                        >
                                            {loading ? 'Updating...' : 'Update Entry'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setSelectedEntry(null);
                                                setContent('');
                                                setAnalysis(null);
                                            }}
                                            className="mt-4 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading || content.length < 10}
                                        className={`flex-1 mt-4 ${theme.backgroundViolet} ${theme.backgroundHover || 'hover:bg-violet-900'} text-white py-2 px-4 rounded-lg cursor-pointer transition-colors`}
                                    >
                                        {loading ? 'Analyzing...' : 'Analyze My Day'}
                                    </button>
                                )}
                            </div>
                        </form>

                        {analysis && (
                            <div className={`mt-6 p-6 ${theme.backgroundCard} rounded-lg max-w-2xl mx-auto shadow-lg ${theme.cardShadow || ''}`}>
                                <h3 className={`font-bold text-xl mb-4 ${theme.textViolet}`}>Your Day Analysis</h3>

                                <div className="mb-4">
                                    <h4 className={`font-semibold ${theme.textViolet} mb-2`}>Mood</h4>
                                    <p className={`text-lg ${theme.inputBackground || 'bg-white'} ${theme.textSecondary} p-3 rounded-lg shadow-sm`}>{analysis.mood}</p>
                                </div>

                                <div className="mb-4">
                                    <h4 className={`font-semibold ${theme.textViolet} mb-2`}>Summary</h4>
                                    <p className={`${theme.inputBackground || 'bg-white'} ${theme.textSecondary} p-3 rounded-lg shadow-sm`}>{analysis.summary}</p>
                                </div>

                                <div>
                                    <h4 className={`font-semibold ${theme.textViolet} mb-2`}>Suggestions for Improving Your Well-being</h4>
                                    <ul className="space-y-2">
                                        {analysis.suggestions.map((suggestion, index) => (
                                            <li key={index} className={`${theme.inputBackground || 'bg-white'} ${theme.textSecondary} p-3 rounded-lg shadow-sm flex items-start`}>
                                                <span className={`${theme.textViolet} mr-2`}>•</span>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={`mt-4 text-sm ${theme.textSecondary || theme.textViolet}`}>
                                    Analysis created: {new Date(analysis.timestamp).toLocaleString('en-US')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ActivityPrompt 
                isOpen={showActivityPrompt}
                onClose={() => setShowActivityPrompt(false)}
                type={promptType}
            />
        </div>
    );
};

export default JournalPage;
