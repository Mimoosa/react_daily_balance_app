const mongoose = require('mongoose');

/**
 * Friend connection schema
 * Represents a friendship or friend request between two users
 */
const friendsSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster friend lookups
friendsSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendsSchema.index({ status: 1 });

// Add a pre-save hook to update the updatedAt field
friendsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Friends = mongoose.model('Friends', friendsSchema);

module.exports = Friends;
