import PropTypes from 'prop-types';

/**
 * JournalEntries Component
 * Displays a list of journal entries with selection functionality
 * 
 * @component
 */
const JournalEntries = ({ journals, selectedEntry, onEntrySelect }) => {
    const isToday = (date) => {
        const today = new Date();
        const entryDate = new Date(date);
        return today.toDateString() === entryDate.toDateString();
    };

    return (
        <div className="h-full overflow-y-auto px-4 py-2">
            {journals.map((entry) => (
                <div
                    key={entry._id}
                    onClick={() => onEntrySelect(entry)}
                    className={`p-4 mb-3 rounded-lg cursor-pointer transition-colors
                        ${selectedEntry?._id === entry._id
                            ? 'bg-violet-100 border-violet-300'
                            : 'hover:bg-gray-50 border-gray-200'}
                        border
                    `}
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-gray-700">
                            {new Date(entry.date).toLocaleDateString()}
                            {isToday(entry.date) && 
                                <span className="ml-2 text-violet-600 text-xs font-bold">(Today)</span>
                            }
                        </p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                </div>
            ))}
            {journals.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No journal entries yet</p>
            )}
        </div>
    );
};

JournalEntries.propTypes = {
    journals: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired
    })).isRequired,
    selectedEntry: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired
    }),
    onEntrySelect: PropTypes.func.isRequired
};

export default JournalEntries;
