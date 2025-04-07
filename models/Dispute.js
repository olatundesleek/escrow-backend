const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    escrowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escrow',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'resolved', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

disputeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;