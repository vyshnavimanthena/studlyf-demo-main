export class CertificatesService {
  public async processCertificates(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const certificatesService = new CertificatesService();
