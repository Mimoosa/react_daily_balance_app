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
        <div className="w-1/4 h-full border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Journal Entries</h3>
            <div className="space-y-2">
                {journals.map((entry) => (
                    <div
                        key={entry._id}
                        onClick={() => onEntrySelect(entry)}
                        className={`p-3 rounded-lg cursor-pointer ${
                            selectedEntry?._id === entry._id
                                ? 'bg-violet-100'
                                : 'hover:bg-gray-100'
                        }`}
                    >
                        <p className="font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                            {isToday(entry.date) && " (Today)"}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{entry.content}</p>
                    </div>
                ))}
            </div>
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
