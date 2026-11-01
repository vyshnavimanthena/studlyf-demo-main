export class LocalStorageDriver {
  public async saveFile(filename: string, _content: Buffer): Promise<string> {
    return `/uploads/${filename}`;
  }
}
