import express from 'express';
import { getEssentials, addEssential, updateEssential, deleteEssential } from '../controllers/essentials.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getEssentials);
router.post('/', verifyToken, addEssential);
router.put('/:id', verifyToken, updateEssential);
router.delete('/:id', verifyToken, deleteEssential);

export default router;