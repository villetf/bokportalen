import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateDto } from '../middleware/validate.js';
import { UserUpdateDTO } from '../dto/UserUpdateDTO.js';

const router = Router();

router.get('/me', authenticate, UsersController.getCurrentUser);
router.patch('/me', authenticate, validateDto(UserUpdateDTO), UsersController.updateCurrentUser);

export default router;