import { Router } from 'express';
import { interviewsController } from '../controllers/interviews.controller';

const router = Router();

router.get('/', (req, res, next) => interviewsController.getInterviews(req, res).catch(next));

export const interviewsRouter = router;
