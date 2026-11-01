export class SdlRepository {
  public async findSdl(): Promise<unknown[]> {
    return [];
  }
}

export const sdlRepository = new SdlRepository();
