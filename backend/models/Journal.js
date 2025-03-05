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
    // Store points as a Mixed type to allow flexible structure
    points: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Store activities as array of objects
    activities: [{
        text: String,
        category: String,
        points: Number
    }],
    activitiesProcessed: {
        type: Boolean,
        default: false
    },
    activitiesCalculatedAt: {
        type: Date,
        default: null
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

// Add a pre-save hook to ensure points and activities are properly handled
journalSchema.pre('save', function(next) {
    // If points is null or undefined, initialize it as empty object
    if (!this.points) {
        this.points = {};
    }
    
    // If activities is null or undefined, initialize it as empty array
    if (!this.activities) {
        this.activities = [];
    }
    
    next();
});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
