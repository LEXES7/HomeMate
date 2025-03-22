import express from 'express';
import { getClothings, addClothing, updateClothing, deleteClothing } from '../controllers/clothing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getClothings);
router.post('/', verifyToken, addClothing);
router.put('/:id', verifyToken, updateClothing);
router.delete('/:id', verifyToken, deleteClothing);

export default router;