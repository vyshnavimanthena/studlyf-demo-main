import { Router } from 'express';
import { careerController } from '../controllers/career.controller';

const router = Router();

router.get('/', (req, res, next) => careerController.getCareer(req, res).catch(next));

export const careerRouter = router;
