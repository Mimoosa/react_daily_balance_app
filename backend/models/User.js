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
    // Friend-related fields
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: {
        received: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        sent: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Add detailed logging for debugging
  console.log(`Matching password for user ${this.username}`);
  console.log(`User has password field: ${!!this.password}`);
  
  // If no password field, return false
  if (!this.password) {
    console.log('No password field found for this user');
    return false;
  }
  
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Method to add a friend
userSchema.methods.addFriend = async function(friendId) {
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId);
    await this.save();
    return true;
  }
  return false;
};

// Method to remove a friend
userSchema.methods.removeFriend = async function(friendId) {
  if (this.friends.includes(friendId)) {
    this.friends = this.friends.filter(id => id.toString() !== friendId.toString());
    await this.save();
    return true;
  }
  return false;
};

// Method to add a friend request
userSchema.methods.addFriendRequest = async function(userId, type) {
  if (type === 'received') {
    const existingRequest = this.friendRequests.received.find(
      req => req.user.toString() === userId.toString()
    );
    
    if (!existingRequest) {
      this.friendRequests.received.push({ user: userId });
      await this.save();
      return true;
    }
  } else if (type === 'sent') {
    const existingRequest = this.friendRequests.sent.find(
      req => req.user.toString() === userId.toString()
    );
    
    if (!existingRequest) {
      this.friendRequests.sent.push({ user: userId });
      await this.save();
      return true;
    }
  }
  return false;
};

// Method to remove a friend request
userSchema.methods.removeFriendRequest = async function(userId, type) {
  if (type === 'received') {
    this.friendRequests.received = this.friendRequests.received.filter(
      req => req.user.toString() !== userId.toString()
    );
  } else if (type === 'sent') {
    this.friendRequests.sent = this.friendRequests.sent.filter(
      req => req.user.toString() !== userId.toString()
    );
  }
  await this.save();
  return true;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
