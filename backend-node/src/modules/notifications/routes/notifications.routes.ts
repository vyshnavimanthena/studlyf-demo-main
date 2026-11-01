import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';

const router = Router();

router.get('/', (req, res, next) => notificationsController.getNotifications(req, res).catch(next));

export const notificationsRouter = router;
