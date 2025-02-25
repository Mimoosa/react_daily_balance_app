const mongoose = require('mongoose');

const activityPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    points: {
        Physical: { type: Number, default: 0 },
        Psychological: { type: Number, default: 0 },
        Social: { type: Number, default: 0 },
        Cognitive: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('ActivityPoints', activityPointsSchema);
