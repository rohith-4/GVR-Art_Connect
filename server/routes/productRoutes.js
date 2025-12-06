// create this new file if it doesn't exist
import express from 'express';
import { getAllCategories } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.get('/categories', getAllCategories);

export default productRouter;