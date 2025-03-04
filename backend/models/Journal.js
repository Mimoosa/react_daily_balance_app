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
    },
    // Flag to track whether activities have been processed
    activitiesProcessed: {
        type: Boolean,
        default: false
    },
    // Points by category
    points: {
        Physical: { type: Number, default: 0 },
        Psychological: { type: Number, default: 0 },
        Social: { type: Number, default: 0 },
        Cognitive: { type: Number, default: 0 }
    },
    // Individual activities with their categorization and points
    activities: [
        {
            text: String,
            category: String,
            points: Number
        }
    ]
}, {
    timestamps: true
});

// Ensure one entry per day per user
journalSchema.index({ user: 1, date: 1 }, { unique: true });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
