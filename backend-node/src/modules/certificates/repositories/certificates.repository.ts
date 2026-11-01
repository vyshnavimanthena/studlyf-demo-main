export class CertificatesRepository {
  public async findCertificates(): Promise<unknown[]> {
    return [];
  }
}

export const certificatesRepository = new CertificatesRepository();
