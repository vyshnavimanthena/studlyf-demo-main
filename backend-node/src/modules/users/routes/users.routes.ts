import { Router } from 'express';
import { usersController } from '../controllers/users.controller';

const router = Router();

router.get('/', (req, res, next) => usersController.getUsers(req, res).catch(next));

export const usersRouter = router;
