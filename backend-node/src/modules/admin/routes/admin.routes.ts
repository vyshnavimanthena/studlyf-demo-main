import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

router.get('/', (req, res, next) => adminController.getAdmin(req, res).catch(next));

export const adminRouter = router;
