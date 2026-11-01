import { Router } from 'express';
import { coursesController } from '../controllers/courses.controller';

const router = Router();

router.get('/', (req, res, next) => coursesController.getCourses(req, res).catch(next));

export const coursesRouter = router;
