import { useState, useEffect } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import { journalService } from '../services/api';
import JournalEntries from '../components/journal/JournalEntries';

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
    const { theme } = useTheme();
    const [content, setContent] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [journals, setJournals] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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
            const data = await journalService.updateEntry(selectedEntry._id, content);
            setAnalysis(data.analysis);
            await fetchJournals();
            setIsEditing(false);
        } catch (error) {
            setError(error.message || 'Failed to update entry');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Checks if a given date is today
     * @function
     * @param {Date|string} date - The date to check
     * @returns {boolean} True if the date is today, false otherwise
     */
    const isToday = (date) => {
        const today = new Date();
        const entryDate = new Date(date);
        return today.toDateString() === entryDate.toDateString();
    };

    return (
        <div className={`h-screen w-full ${theme.background} flex`}>
            {/* Sidebar with Journal Entries */}
            <JournalEntries 
                journals={journals}
                selectedEntry={selectedEntry}
                onEntrySelect={handleEntrySelect}
            />

            {/* Journal Entry Form */}
            <div className="flex-1 p-6">
                <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
                    {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
                </h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                    <textarea
                        className={`w-full h-48 p-3 border rounded-lg focus:outline-none bg-white text-black
                            ${error ? 'border-red-500' : 'border-black'}`}
                        placeholder="How was your day? Share your activities and experiences..."
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setError('');
                        }}
                        minLength={10}
                    />
                    
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="flex-1 mt-4 bg-violet-700 text-white py-2 px-4 rounded-lg hover:bg-violet-900 disabled:bg-gray-400"
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
                                    className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || content.length < 10}
                                className="flex-1 mt-4 bg-violet-700 text-white py-2 px-4 rounded-lg hover:bg-violet-900 disabled:bg-gray-400"
                            >
                                {loading ? 'Analyzing...' : 'Analyze My Day'}
                            </button>
                        )}
                    </div>
                </form>
                
                {analysis && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Analysis</h3>
                        <p><strong>Mood:</strong> {analysis.mood}</p>
                        <p><strong>Summary:</strong> {analysis.summary}</p>
                        <div className="mt-2">
                            <strong>Suggestions:</strong>
                            <ul className="list-disc ml-5">
                                {analysis.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalPage;
