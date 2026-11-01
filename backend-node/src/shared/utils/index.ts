export function getPaginationParams(queryPage?: string, queryLimit?: string) {
  const page = Math.max(1, parseInt(queryPage || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
