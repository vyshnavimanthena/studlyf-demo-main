export class OpenAIProvider {
  public async generateCompletion(prompt: string): Promise<string> {
    return `[OPENAI PLACEHOLDER] Completion for: ${prompt.substring(0, 20)}...`;
  }
}
