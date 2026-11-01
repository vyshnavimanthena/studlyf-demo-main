import { Router } from 'express';
import { eventsController } from '../controllers/events.controller';

const router = Router();

router.get('/', (req, res, next) => eventsController.getEvents(req, res).catch(next));

export const eventsRouter = router;
