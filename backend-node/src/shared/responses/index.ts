export function formatResponse<T>(
  message: string,
  data?: T,
  statusCode = 200,
  meta?: Record<string, unknown>,
) {
  return {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}
