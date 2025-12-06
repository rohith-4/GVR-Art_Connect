import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profilePic: { type: String, default: '' },

  // artworks the buyer is interested in (references to product/artwork model)
  artworksInterested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],

  // orders and liked products
  productsOrdered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],
  productsLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],

  // additional buyer-specific fields
  wishlistNotes: { type: String, default: '' }
}, { timestamps: true });

/**
 * Helper to create a buyer profile from a created user.
 * Call Buyer.createFromUser(user) after successful signup when role === 'buyer'
 */
buyerSchema.statics.createFromUser = async function (user) {
  if (!user) throw new Error('user required');
  return this.create({
    userId: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.photoURL || ''
  });
};

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', buyerSchema);
export default Buyer;