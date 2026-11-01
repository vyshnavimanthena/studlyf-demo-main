export class S3StorageDriver {
  public async uploadToS3(_key: string, _body: Buffer): Promise<string> {
    return 'https://s3.amazonaws.com/bucket/key_placeholder';
  }
}
