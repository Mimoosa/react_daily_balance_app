const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs'); // Fix import name

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [6, 'Username must be at least 6 characters long'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [7, 'Password must be at least 7 characters long'],
        validate: {
            validator: function(v) {
                return /^(?=.*[A-Z])(?=.*\d).{7,}$/.test(v);
            },
            message: 'Password must contain at least one uppercase letter and one number'
        }
    },
    journals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal'
    }],
    points: {
        Physical: { type: Number, default: 0 },
        Psychological: { type: Number, default: 0 },
        Social: { type: Number, default: 0 },
        Cognitive: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcryptjs.genSalt(10); // Use bcryptjs
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Change method name from comparePassword to matchPassword
userSchema.methods.matchPassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
