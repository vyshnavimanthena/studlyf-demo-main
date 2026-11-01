import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class CoursesController {
  public async getCourses(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Courses placeholder response', { status: 'ok' }));
  }
}

export const coursesController = new CoursesController();
