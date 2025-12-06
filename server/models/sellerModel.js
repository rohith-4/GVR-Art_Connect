import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true }, // reference to auth user
  name: { type: String, required: true }, // duplicate from auth user for quick access
  email: { type: String, required: true },
  profilePic: { type: String, default: '' },

  // categories of art the seller works with
  categories: [{ type: String }],

  // product references (replace 'pr' with your product model name if different)
  productsAdded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],
  productsOrdered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],
  productsLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'pr' }],

  // additional mutable info
  bio: { type: String, default: '' },
  location: { type: String, default: '' }
}, { timestamps: true });

/**
 * Helper to create a seller profile from a created user.
 * Call Seller.createFromUser(user) after successful signup when role === 'seller'
 */
sellerSchema.statics.createFromUser = async function (user) {
  if (!user) throw new Error('user required');
  return this.create({
    userId: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.photoURL || ''
  });
};

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
export default Seller;