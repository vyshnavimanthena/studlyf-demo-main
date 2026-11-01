export class PDFService {
  public async generatePDFFromHTML(_html: string): Promise<Buffer> {
    return Buffer.from('%PDF-1.4 [PDF PLACEHOLDER]');
  }
}

export const pdfService = new PDFService();
