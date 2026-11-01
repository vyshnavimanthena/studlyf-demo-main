export class GroqProvider {
  public async generateCompletion(prompt: string): Promise<string> {
    return `[GROQ PLACEHOLDER] Completion for: ${prompt.substring(0, 20)}...`;
  }
}
