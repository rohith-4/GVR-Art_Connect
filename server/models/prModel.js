import mongoose from 'mongoose';

const prSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  // new: store number of likes a product received
  likesCount: { type: Number, default: 0 },
  // optional: if you later want to track who liked it, uncomment:
  // likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
}, { timestamps: true });

const Pr = mongoose.models.pr || mongoose.model('pr', prSchema);
export default Pr;