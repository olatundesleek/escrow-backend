const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerEmail: {
    type: String,  // Email for the buyer (in case the buyer is not registered)
    required: true
  },
  sellerEmail: {
    type: String,  // Email for the seller (in case the seller is not registered)
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending','active', 'completed', 'disputed'],
    default: 'pending'
  },
  terms: {  // Array of terms related to the transaction
    type: [String],
    required: true
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

escrowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Escrow = mongoose.model('Escrow', escrowSchema);

module.exports = Escrow;
