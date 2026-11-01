export class GeminiProvider {
  public async generateCompletion(prompt: string): Promise<string> {
    return `[GEMINI PLACEHOLDER] Completion for: ${prompt.substring(0, 20)}...`;
  }
}
