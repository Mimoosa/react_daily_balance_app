const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        minlength: [6, 'Username must be at least 6 characters long'],
        trim: true
    },
        password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [7, 'Password must be at least 7 characters long'],
        validate: {
            validator: function(v) {
                return /^(?=.*[A-Z])(?=.*\d).{7,}$/.test(v);
            },
            message: 'Password must contain at least one uppercase letter and one number'
        },
        select: false
    },
    journals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal'
    }],
    points: {
        type: Object,
        default: {
            Physical: 100,
            Psychological: 100,
            Social: 100,
            Cognitive: 100
        }
    },
    totalPoints: {
        type: Object,
        default: {
            Physical: 100,
            Psychological: 100,
            Social: 100,
            Cognitive: 100
        }
    },
    streak: {
        count: {
            type: Number,
            default: 0
        },
        lastEntryDate: {
            type: Date,
            default: null
        },
        bestStreak: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
