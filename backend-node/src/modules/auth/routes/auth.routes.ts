import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res).catch(next));
router.post('/signup', (req, res, next) => authController.signup(req, res).catch(next));

export const authRouter = router;
