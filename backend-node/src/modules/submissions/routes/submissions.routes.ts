import { Router } from 'express';
import { submissionsController } from '../controllers/submissions.controller';

const router = Router();

router.get('/', (req, res, next) => submissionsController.getSubmissions(req, res).catch(next));

export const submissionsRouter = router;
