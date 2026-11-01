export class CoursesRepository {
  public async findCourses(): Promise<unknown[]> {
    return [];
  }
}

export const coursesRepository = new CoursesRepository();
