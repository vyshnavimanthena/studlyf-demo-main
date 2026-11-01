import { Router } from 'express';
import { sdlController } from '../controllers/sdl.controller';

const router = Router();

router.get('/', (req, res, next) => sdlController.getSdl(req, res).catch(next));

export const sdlRouter = router;
