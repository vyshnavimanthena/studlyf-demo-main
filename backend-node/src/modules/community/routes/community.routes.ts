import { Router } from 'express';
import { communityController } from '../controllers/community.controller';

const router = Router();

router.get('/', (req, res, next) => communityController.getCommunity(req, res).catch(next));

export const communityRouter = router;
