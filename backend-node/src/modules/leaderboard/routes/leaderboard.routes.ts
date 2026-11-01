import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', (req, res, next) => leaderboardController.getLeaderboard(req, res).catch(next));

export const leaderboardRouter = router;
