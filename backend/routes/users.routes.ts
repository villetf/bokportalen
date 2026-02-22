import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/me', authenticate, UsersController.getCurrentUser);

export default router;