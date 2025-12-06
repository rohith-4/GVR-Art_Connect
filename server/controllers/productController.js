import Pr from '../models/prModel.js';

export const getAllCategories = async (req, res) => {
  try {
    // fetch all products and extract unique categories
    const products = await Pr.find({}, 'category').lean();
    
    // flatten and split comma-separated categories, then deduplicate
    const allCategories = new Set();
    products.forEach(p => {
      if (p.category && typeof p.category === 'string') {
        // split by comma and trim each category
        const cats = p.category.split(',').map(c => c.trim()).filter(c => c.length > 0);
        cats.forEach(cat => allCategories.add(cat));
      }
    });

    // convert Set to sorted array
    const uniqueCategories = Array.from(allCategories).sort();

    return res.json({ success: true, categories: uniqueCategories });
  } catch (error) {
    console.error('getAllCategories error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const likeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    // increment likesCount by 1
    const product = await Pr.findByIdAndUpdate(productId, { $inc: { likesCount: 1 } }, { new: true });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const unlikeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    // decrement likesCount but not below 0
    const product = await Pr.findByIdAndUpdate(
      productId,
      [{ $set: { likesCount: { $max: [{ $subtract: ['$likesCount', 1] }, 0] } } }],
      { new: true }
    );
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};