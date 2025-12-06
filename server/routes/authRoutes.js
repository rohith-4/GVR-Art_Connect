import express from 'express';
import { login, register, logout, getMe } from '../controllers/authcontroller.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// protect or not depending on your middleware — temporarily remove userAuth to test
router.get('/me', userAuth, getMe);
// router.get('/me', getMe); // try this if userAuth might block the request during debugging

export default router;
