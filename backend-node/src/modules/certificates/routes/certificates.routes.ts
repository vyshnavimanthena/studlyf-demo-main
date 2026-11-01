import { Router } from 'express';
import { certificatesController } from '../controllers/certificates.controller';

const router = Router();

router.get('/', (req, res, next) => certificatesController.getCertificates(req, res).catch(next));

export const certificatesRouter = router;
