import { Router } from 'express';
import { teamsController } from '../controllers/teams.controller';

const router = Router();

router.get('/', (req, res, next) => teamsController.getTeams(req, res).catch(next));

export const teamsRouter = router;
