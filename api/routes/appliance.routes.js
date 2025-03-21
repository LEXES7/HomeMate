import express from 'express';
import { getAppliances, addAppliance, updateAppliance, deleteAppliance } from '../controllers/appliance.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getAppliances);
router.post('/', verifyToken, addAppliance);
router.put('/:id', verifyToken, updateAppliance);
router.delete('/:id', verifyToken, deleteAppliance);

export default router;