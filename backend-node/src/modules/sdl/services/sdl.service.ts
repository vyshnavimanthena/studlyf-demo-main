export class SdlService {
  public async processSdl(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const sdlService = new SdlService();
