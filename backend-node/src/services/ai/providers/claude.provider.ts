export class ClaudeProvider {
  public async generateCompletion(prompt: string): Promise<string> {
    return `[CLAUDE PLACEHOLDER] Completion for: ${prompt.substring(0, 20)}...`;
  }
}
