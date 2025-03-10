const mongoose = require('mongoose');

const weeklyPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    points: {
        Physical: { type: Number, default: 100 },
        Psychological: { type: Number, default: 100 },
        Social: { type: Number, default: 100 },
        Cognitive: { type: Number, default: 100 }
    },
    isCurrentWeek: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create a compound index to ensure one entry per week per user
weeklyPointsSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyPoints', weeklyPointsSchema); 