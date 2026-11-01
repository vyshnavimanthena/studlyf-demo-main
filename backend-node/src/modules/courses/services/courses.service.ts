export class CoursesService {
  public async processCourses(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const coursesService = new CoursesService();
