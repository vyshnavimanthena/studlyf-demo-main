import { Router } from 'express';
import { opportunitiesController } from '../controllers/opportunities.controller';

const router = Router();

router.get('/', (req, res, next) => opportunitiesController.getOpportunities(req, res).catch(next));

export const opportunitiesRouter = router;
