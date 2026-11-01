import { Router } from 'express';
import { institutionsController } from '../controllers/institutions.controller';

const router = Router();

router.get('/', (req, res, next) => institutionsController.getInstitutions(req, res).catch(next));

export const institutionsRouter = router;
