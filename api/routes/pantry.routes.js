import express from 'express';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '../controllers/pantry.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getPantryItems);
router.post('/', verifyToken, addPantryItem);
router.put('/:id', verifyToken, updatePantryItem);
router.delete('/:id', verifyToken, deletePantryItem);

export default router;