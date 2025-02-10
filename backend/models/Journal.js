const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Journal content is required'],
        minlength: [10, 'Journal entry must be at least 10 characters long']
    },
    analysis: {
        mood: String,
        summary: String,
        suggestions: [String],
        timestamp: Date
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Ensure one entry per day per user
journalSchema.index({ user: 1, date: 1 }, { unique: true });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
