import { Router } from 'express';
import { gamificationController } from '../controllers/gamification.controller';

const router = Router();

router.get('/', (req, res, next) => gamificationController.getGamification(req, res).catch(next));

export const gamificationRouter = router;
