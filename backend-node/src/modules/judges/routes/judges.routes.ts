import { Router } from 'express';
import { judgesController } from '../controllers/judges.controller';

const router = Router();

router.get('/', (req, res, next) => judgesController.getJudges(req, res).catch(next));

export const judgesRouter = router;
