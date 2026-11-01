export function parseAIJsonResponse<T>(rawOutput: string): T {
  try {
    return JSON.parse(rawOutput) as T;
  } catch (_e) {
    throw new Error('Failed to parse AI JSON response');
  }
}
